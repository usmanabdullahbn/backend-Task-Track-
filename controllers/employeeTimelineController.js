import EmployeeTimeline from "../models/EmployeeTimeline.js";
import { DEFAULT_OFFICE_LOCATION } from "../config/constants.js";

export const saveEmployeeTimeline = async (req, res) => {
  try {
    const { employeeId, employeeName, task, date } = req.body;

    // Validate required fields
    if (!employeeId || !employeeName || !task || !date) {
      return res.status(400).json({
        message: "Missing required fields: employeeId, employeeName, task, date",
      });
    }

    // Check if timeline already exists for this date and employee
    const existingTimeline = await EmployeeTimeline.findOne({
      employeeId,
      date,
    });

    if (existingTimeline) {
      // Update: Push new task to existing timeline
      const updatedTimeline = await EmployeeTimeline.findOneAndUpdate(
        { employeeId, date },
        {
          $push: {
            tasks: {
              lat: task.lat,
              lng: task.lng,
              title: task.title,
            },
          },
        },
        { new: true }
      );

      return res.json({
        message: "Task added to existing timeline",
        timeline: updatedTimeline,
      });
    } else {
      // Create: New timeline with first task and default office
      const timeline = await EmployeeTimeline.create({
        employeeId,
        employeeName,
        date,
        office: DEFAULT_OFFICE_LOCATION,
        tasks: [
          {
            lat: task.lat,
            lng: task.lng,
            title: task.title,
          },
        ],
      });

      return res.status(201).json({
        message: "Timeline created with first task",
        timeline,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all employee timelines
export const getAllTimelines = async (req, res) => {
  try {
    const timelines = await EmployeeTimeline.find().sort({ createdAt: -1 });

    res.json({
      message: "All timelines retrieved successfully",
      count: timelines.length,
      timelines,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get timelines by date
export const getTimelineByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const timelines = await EmployeeTimeline.find({ date }).sort({
      createdAt: -1,
    });

    res.json({
      message: `Timelines for ${date} retrieved successfully`,
      count: timelines.length,
      timelines,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get timelines by employee id
export const getTimelineByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const timelines = await EmployeeTimeline.find({ employeeId }).sort({
      date: -1,
    });

    res.json({
      message: `Timelines for employee ${employeeId} retrieved successfully`,
      count: timelines.length,
      timelines,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get timeline by employee id and date
export const getTimelineByEmployeeIdAndDate = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    if (!employeeId || !date) {
      return res
        .status(400)
        .json({ message: "Employee ID and Date are required" });
    }

    const timeline = await EmployeeTimeline.findOne({
      employeeId,
      date,
    });

    if (!timeline) {
      return res.status(404).json({
        message: `Timeline not found for employee ${employeeId} on ${date}`,
      });
    }

    res.json({
      message: "Timeline retrieved successfully",
      timeline,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
