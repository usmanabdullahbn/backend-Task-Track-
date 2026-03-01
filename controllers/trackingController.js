import mongoose from 'mongoose';
import WorkSession from '../models/WorkSession.js';
import LocationPoint from '../models/LocationPoint.js';
import TaskVisit from '../models/TaskVisit.js';
import IdleLog from '../models/IdleLog.js';

// Haversine formula to calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// Auto create or get daily session
async function getOrCreateSession(workerId, date) {
  // FIX #6: Ensure workerId is ObjectId before querying
  let workerObjectId = workerId;
  if (typeof workerId === 'string') {
    try {
      workerObjectId = new mongoose.Types.ObjectId(workerId);
    } catch (error) {
      throw new Error("Invalid Worker ID format");
    }
  }

  let session = await WorkSession.findOne({ workerId: workerObjectId, date });
  if (!session) {
    session = await WorkSession.create({
      workerId: workerObjectId,
      date,
      startTime: new Date()
    });
  }
  return session;
}

// Save location
export const saveLocation = async (req, res) => {
  try {
    const { workerId, latitude, longitude, speed } = req.body;

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID required" });
    }

    // FIX #4: Convert string workerId to ObjectId for consistency
    let workerObjectId;
    try {
      workerObjectId = new mongoose.Types.ObjectId(workerId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Worker ID format" });
    }

    // Data validation
    if (!latitude || !longitude || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    // use client-supplied date when available, otherwise fall back to Qatar local day
    const today = req.body.date ||
      new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Qatar' }))
        .toISOString()
        .split('T')[0];

    const session = await getOrCreateSession(workerObjectId, today);

    // Auto close session at end of day (6 PM)
    if (new Date().getHours() >= 18 && session.status === "active") {
      session.endTime = new Date();
      session.status = "closed";
      await session.save();
    }

    // Step 1: Find last location first
    const lastLocation = await LocationPoint.findOne({
      workerId: workerObjectId,
      sessionId: session._id
    }).sort({ timestamp: -1 });

    // Step 2: Calculate distance if last location exists
    if (lastLocation) {
      const distance = getDistance(lastLocation.latitude, lastLocation.longitude, latitude, longitude);

      // Prevent fake distance (ignore jumps > 2km)
      if (distance <= 2) {
        session.totalDistance += distance;
        await session.save();
      }
    }

    // Step 3: Now save new location
    // Determine type: first location is start; if the session has been closed, mark as end
    let locationType = 'regular';
    if (!lastLocation) {
      locationType = 'start';
    }
    if (session.status === 'closed') {
      // the last point we receive after closing should be tagged as end
      locationType = 'end';
    }

    const now = new Date();
    const locationPoint = await LocationPoint.create({
      workerId: workerObjectId,
      sessionId: session._id,
      latitude,
      longitude,
      timestamp: now,
      speed: speed || 0,
      locationName: req.body.locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      // prefer any value the app sent (already formatted in 24‑hour); fallback to server compute
      timeFormatted: req.body.timeFormatted || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: req.body.date || new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Qatar' })).toISOString().split('T')[0],
      locationType,
    });

    // Professional idle logic: track start/end
    let idleLog = await IdleLog.findOne({
      workerId: workerObjectId,
      sessionId: session._id,
      endTime: null
    });

    if (speed < 2) {
      // Start idle if not already
      if (!idleLog) {
        // FIX #4: Record idle start location
        console.log(`Idle started at ${new Date().toLocaleTimeString()}`);
        await IdleLog.create({
          workerId: workerObjectId,
          sessionId: session._id,
          startTime: new Date(),
          endTime: null
        });
      }
    } else {
      // Worker moving again → close idle
      if (idleLog) {
        idleLog.endTime = new Date();
        idleLog.duration = idleLog.endTime - idleLog.startTime;

        await idleLog.save();

        // FIX #4: Log idle duration in minutes
        const idleDurationMinutes = Math.floor(idleLog.duration / 60000);
        console.log(`Idle ended after ${idleDurationMinutes} minutes at ${new Date().toLocaleTimeString()}`);

        session.totalIdleDuration += idleLog.duration;
        await session.save();

        // Mark current location as idle point
        await LocationPoint.updateOne(
          { _id: locationPoint._id },
          { locationType: 'idle' }
        );
      }
    }

    res.status(200).json({ message: 'Location saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start task
export const startTask = async (req, res) => {
  try {
    const { taskId, latitude, longitude, workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID required" });
    }

    if (!taskId) {
      return res.status(400).json({ message: "Task ID required" });
    }

    // FIX #5: Convert workerId string to ObjectId
    let workerObjectId, taskObjectId;
    try {
      workerObjectId = new mongoose.Types.ObjectId(workerId);
      taskObjectId = new mongoose.Types.ObjectId(taskId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Worker ID or Task ID format" });
    }

    // maintain same client-date logic used in location upload
    const today = req.body.date ||
      new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Qatar' }))
        .toISOString()
        .split('T')[0];

    const session = await getOrCreateSession(workerObjectId, today);

    const taskVisit = await TaskVisit.create({
      workerId: workerObjectId,
      sessionId: session._id,
      taskId: taskObjectId,
      latitude,
      longitude,
      startTime: new Date()
    });

    res.status(200).json({ taskVisit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Worker left task (left location/time)
export const leaveTask = async (req, res) => {
  try {
    const { taskId, workerId, latitude, longitude } = req.body;

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID required" });
    }
    if (!taskId) {
      return res.status(400).json({ message: "Task ID required" });
    }

    // Convert IDs to ObjectId
    let workerObjectId, taskObjectId;
    try {
      workerObjectId = new mongoose.Types.ObjectId(workerId);
      taskObjectId = new mongoose.Types.ObjectId(taskId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Worker ID or Task ID format" });
    }

    // find the active visit that hasn't been ended or marked as left yet
    const taskVisit = await TaskVisit.findOne({
      workerId: workerObjectId,
      taskId: taskObjectId,
      endTime: null,
      leftTime: null
    }).sort({ startTime: -1 });

    if (taskVisit) {
      const now = new Date();
      taskVisit.leftTime = now;
      if (latitude != null) taskVisit.leftLatitude = latitude;
      if (longitude != null) taskVisit.leftLongitude = longitude;
      // duration until leave
      taskVisit.duration = (now - taskVisit.startTime) / 1000; // seconds
      await taskVisit.save();
    }

    res.status(200).json({ taskVisit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// End task
export const endTask = async (req, res) => {
  try {
    const { taskId, workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID required" });
    }

    if (!taskId) {
      return res.status(400).json({ message: "Task ID required" });
    }

    // FIX #5: Convert IDs to ObjectId
    let workerObjectId, taskObjectId;
    try {
      workerObjectId = new mongoose.Types.ObjectId(workerId);
      taskObjectId = new mongoose.Types.ObjectId(taskId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Worker ID or Task ID format" });
    }

    const taskVisit = await TaskVisit.findOne({
      workerId: workerObjectId,
      taskId: taskObjectId,
      endTime: null
    }).sort({ startTime: -1 });

    if (taskVisit) {
      taskVisit.endTime = new Date();
      taskVisit.duration = (taskVisit.endTime - taskVisit.startTime) / 1000; // seconds
      await taskVisit.save();
    }

    res.status(200).json({ taskVisit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get timeline
export const getTimeline = async (req, res) => {
  try {
    const { workerId, date } = req.query;

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID required" });
    }

    // FIX #1: Convert string workerId to ObjectId for proper MongoDB query
    let workerObjectId;
    try {
      workerObjectId = new mongoose.Types.ObjectId(workerId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Worker ID format" });
    }

    const session = await WorkSession.findOne({ workerId: workerObjectId, date });
    if (!session) {
      return res.status(404).json({ message: 'No session found' });
    }

    let locations = await LocationPoint.find({ sessionId: session._id }).sort({ timestamp: 1 });
    // make sure any missing or legacy entries still have a 24-hour string, but do not override app-supplied values
    locations = locations.map(loc => {
      let tf = loc.timeFormatted;
      if (!tf || tf.includes('AM') || tf.includes('PM')) {
        tf = new Date(loc.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return { ...loc.toObject(), timeFormatted: tf };
    });

    // FIX #3: Populate task details instead of just IDs
    const tasks = await TaskVisit.find({ sessionId: session._id })
      .populate('taskId', 'title name description')
      .sort({ startTime: 1 });
    const idleLogs = await IdleLog.find({ sessionId: session._id }).sort({ startTime: 1 });

    // Calculate idle minutes for display
    const idleMinutes = Math.floor(session.totalIdleDuration / (1000 * 60));

    res.status(200).json({
      session,
      locations,
      tasks,
      idleLogs,
      idleMinutes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};