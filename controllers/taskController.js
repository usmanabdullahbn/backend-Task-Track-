import Task from "../models/Task.js"
import TaskAssignment from "../models/TaskAssignment.js"

export const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, priority } = req.query
    const skip = (page - 1) * limit

    let query = {}

    if (search) {
      query.title = { $regex: search, $options: "i" }
    }

    if (status) query.status = status
    if (priority) query.priority = priority

    const tasks = await Task.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 })

    const total = await Task.countDocuments(query)

    res.status(200).json({
      success: true,
      tasks,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    const assignments = await TaskAssignment.find({ task_id: req.params.id })

    res.status(200).json({
      success: true,
      task,
      assignments,
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get tasks by Order ID
export const getTaskByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params

    const tasks = await Task.find({ "order.id": orderId }).sort({ created_at: -1 })

    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found for this order" })
    }

    res.status(200).json({ success: true, tasks })
  } catch (error) {
    next(error)
  }
}

// ✅ Get tasks by Customer ID
export const getTaskByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params

    const tasks = await Task.find({ "customer.id": customerId }).sort({ created_at: -1 })

    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found for this customer" })
    }

    res.status(200).json({ success: true, tasks })
  } catch (error) {
    next(error)
  }
}

export const getTaskByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10, status, priority } = req.query

    const skip = (page - 1) * limit

    const query = { "user.id": userId }

    if (status) query.status = status
    if (priority) query.priority = priority

    const tasks = await Task.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 })

    const total = await Task.countDocuments(query)

    res.status(200).json({
      success: true,
      tasks,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}


// ✅ Get tasks by Project ID
export const getTaskByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.params

    const tasks = await Task.find({ "project.id": projectId }).sort({ created_at: -1 })

    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found for this project" })
    }

    res.status(200).json({ success: true, tasks })
  } catch (error) {
    next(error)
  }
}

export const createTask = async (req, res, next) => {
  try {
    const {
      customer,
      user,
      project,
      asset,
      order,
      title,
      description,
      plan_duration,
      start_time,
      end_time,
      priority,
    } = req.body

    // Handle multiple file uploads
    let fileUploads = []
    if (req.files) {
      // Handle different possible field names
      const allFiles = []
      if (req.files.files) allFiles.push(...req.files.files)
      if (req.files.file_upload) allFiles.push(...req.files.file_upload)
      if (req.files['files[]']) allFiles.push(...req.files['files[]'])

      if (allFiles.length > 0) {
        fileUploads = allFiles.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${file.filename}` // URL path for accessing the file
        }))
      }
    }

    // ⛔ Validate required time fields
    if (!start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time are required",
      })
    }

    // 🔍 CHECK IF USER IS OCCUPIED
    const occupiedTask = await Task.findOne({
      "user.id": user.id,
      start_time: { $lt: new Date(end_time) },
      end_time: { $gt: new Date(start_time) },
    })

    if (occupiedTask) {
      return res.status(409).json({
        success: false,
        message: "User is already occupied during this time",
        occupiedTask: {
          id: occupiedTask._id,
          title: occupiedTask.title,
          start_time: occupiedTask.start_time,
          end_time: occupiedTask.end_time,
        },
      })
    }

    // ✅ CREATE TASK
    const task = await Task.create({
      customer,
      user,
      project,
      asset,
      order,
      title,
      description,
      plan_duration,
      start_time,
      end_time,
      file_upload: fileUploads, // Store array of file objects
      priority,
      created_user: req.body.userId,
    })

    res.status(201).json({
      success: true,
      task,
    })
  } catch (error) {
    next(error)
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    const {
      customer,
      user,
      project,
      asset,
      order,
      title,
      description,
      plan_duration,
      start_time,
      end_time,
      actual_start_time,
      actual_end_time,
      file_upload,
      priority,
      status,
      percentage_complete,
    } = req.body

    // Determine final user, start_time, end_time for occupation check
    let user_id = user ? user.id : task.user.id
    let final_start = start_time !== undefined ? start_time : task.start_time
    let final_end = end_time !== undefined ? end_time : task.end_time

    // Check if user is occupied only if user, start_time, or end_time is being updated
    if (user || start_time !== undefined || end_time !== undefined) {
      // 🔍 CHECK IF USER IS OCCUPIED
      const occupiedTask = await Task.findOne({
        "user.id": user_id,
        start_time: { $lt: new Date(final_end) },
        end_time: { $gt: new Date(final_start) },
        _id: { $ne: req.params.id }
      })

      if (occupiedTask) {
        return res.status(409).json({
          success: false,
          message: "User is already occupied during this time",
          occupiedTask: {
            id: occupiedTask._id,
            title: occupiedTask.title,
            start_time: occupiedTask.start_time,
            end_time: occupiedTask.end_time,
          },
        })
      }
    }

    if (customer) task.customer = customer
    if (user) task.user = user
    if (project) task.project = project
    if (asset) task.asset = asset
    if (order) task.order = order

    if (title) task.title = title
    if (description) task.description = description
    if (plan_duration) task.plan_duration = plan_duration
    if (start_time) task.start_time = start_time
    if (end_time) task.end_time = end_time
    if (actual_start_time) task.actual_start_time = actual_start_time
    if (actual_end_time) task.actual_end_time = actual_end_time

    // Handle multiple file uploads - append to existing files if any
    if (req.files) {
      const allFiles = []
      if (req.files.files) allFiles.push(...req.files.files)
      if (req.files.file_upload) allFiles.push(...req.files.file_upload)
      if (req.files['files[]']) allFiles.push(...req.files['files[]'])

      if (allFiles.length > 0) {
        const newFileUploads = allFiles.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${file.filename}`
        }))

        // Merge with existing files or create new array
        task.file_upload = task.file_upload ? [...task.file_upload, ...newFileUploads] : newFileUploads
      }
    }

    if (priority) task.priority = priority
    if (status) task.status = status

    if (percentage_complete !== undefined)
      task.percentage_complete = percentage_complete

    if (status === "Completed") {
      task.completed = true
      task.percentage_complete = 100
    }

    task.modified_at = new Date()
    task.modified_user = req.body.userId

    await task.save()

    res.status(200).json({
      success: true,
      task,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const assignTask = async (req, res, next) => {
  try {
    const { employee_id, notes } = req.body

    const assignment = await TaskAssignment.create({
      task_id: req.params.id,
      employee_id,
      notes,
    })

    res.status(201).json({
      success: true,
      assignment,
    })
  } catch (error) {
    next(error)
  }
}

export const updateTaskAssignment = async (req, res, next) => {
  try {
    const { status, hours_spent, actual_completion_date, notes } = req.body

    const assignment = await TaskAssignment.findById(req.params.assignmentId)

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    if (status) assignment.status = status
    if (hours_spent) assignment.hours_spent = hours_spent
    if (actual_completion_date) assignment.actual_completion_date = actual_completion_date
    if (notes) assignment.notes = notes

    assignment.modified_at = new Date()

    await assignment.save()

    res.status(200).json({
      success: true,
      assignment,
    })
  } catch (error) {
    next(error)
  }
}
