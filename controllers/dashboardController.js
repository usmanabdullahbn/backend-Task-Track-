import Asset from "../models/Asset.js"
import Customer from "../models/Customer.js"
import Order from "../models/Order.js"
import Project from "../models/Project.js"
import Task from "../models/Task.js"
import User from "../models/User.js"

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments()
    const totalCustomers = await Customer.countDocuments()
    const totalProjects = await Project.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalTasks = await Task.countDocuments()
    const totalAssets = await Asset.countDocuments()
    // const totalEmployees = await Employee.countDocuments()

    const activeProjects = await Project.countDocuments({ status: "Active" })
    const completedProjects = await Project.countDocuments({ status: "Completed" })
    const completedTasks = await Task.countDocuments({ status: "Completed" })
    const inProgressTasks = await Task.countDocuments({ status: "In Progress" })
    const pendingOrders = await Order.countDocuments({ status: "Pending" })
    const completedOrders = await Order.countDocuments({ status: "Completed" })

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalProjects,
        totalOrders,
        totalTasks,
        totalAssets,
        totalEmployees,
        activeProjects,
        completedProjects,
        completedTasks,
        inProgressTasks,
        pendingOrders,
        completedOrders,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getRecentActivities = async (req, res, next) => {
  try {
    const recentOrders = await Order.find().populate("customer_id").limit(5).sort({ created_at: -1 })

    const recentProjects = await Project.find().populate("customer_id").limit(5).sort({ created_at: -1 })

    const recentTasks = await Task.find().limit(5).sort({ created_at: -1 })

    res.status(200).json({
      success: true,
      activities: {
        recentOrders,
        recentProjects,
        recentTasks,
      },
    })
  } catch (error) {
    next(error)
  }
}
