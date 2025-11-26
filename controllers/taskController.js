import Task from "../models/Task.js"
import TaskAssignment from "../models/TaskAssignment.js"

export const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, priority } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (search) {
      query.title = { $regex: search, $options: "i" }
    }
    if (status) query.status = status
    if (priority) query.priority = priority

    const tasks = await Task.find(query)
      .populate("project_id")
      .populate("asset_id")
      .populate("order_id")
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ created_at: -1 })

    const total = await Task.countDocuments(query)

    res.status(200).json({
      success: true,
      tasks,
      total,
      page: Number.parseInt(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project_id")
      .populate("asset_id")
      .populate("order_id")
      .populate("customer_id")

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    const assignments = await TaskAssignment.find({ task_id: req.params.id }).populate("employee_id")

    res.status(200).json({
      success: true,
      task,
      assignments,
    })
  } catch (error) {
    next(error)
  }
}

export const createTask = async (req, res, next) => {
  try {
    const {
      asset_id,
      order_id,
      project_id,
      customer_id,
      title,
      description,
      plan_duration,
      start_time,
      end_time,
      file_upload,
      priority,
    } = req.body

    const task = await Task.create({
      asset_id,
      order_id,
      project_id,
      customer_id,
      title,
      description,
      plan_duration,
      start_time,
      end_time,
      file_upload,
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
    const {
      asset_id,
      order_id,
      project_id,
      customer_id,
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

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    if (asset_id) task.asset_id = asset_id
    if (order_id) task.order_id = order_id
    if (project_id) task.project_id = project_id
    if (customer_id) task.customer_id = customer_id
    if (title) task.title = title
    if (description) task.description = description
    if (plan_duration) task.plan_duration = plan_duration
    if (start_time) task.start_time = start_time
    if (end_time) task.end_time = end_time
    if (actual_start_time) task.actual_start_time = actual_start_time
    if (actual_end_time) task.actual_end_time = actual_end_time
    if (file_upload) task.file_upload = file_upload
    if (priority) task.priority = priority
    if (status) task.status = status
    if (percentage_complete !== undefined) task.percentage_complete = percentage_complete

    task.modified_at = new Date()
    task.modified_user = req.body.userId

    if (status === "Completed") {
      task.completed = true
      task.percentage_complete = 100
    }

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
