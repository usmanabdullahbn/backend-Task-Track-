import express from "express"
import {
  assignTask,
  createTask,
  deleteTask,
  getTaskByCustomerId,
  getTaskById,
  getTaskByOrderId,
  getTaskByProjectId,
  getTaskByUserId,
  getTasks,
  updateTask,
  updateTaskAssignment,
} from "../controllers/taskController.js"
import { uploadMultiple } from "../config/multer.js"

const router = express.Router()


router.get("/", getTasks)
router.get("/:id", getTaskById)
router.post("/", uploadMultiple, createTask)
router.put("/:id", uploadMultiple, updateTask)
router.delete("/:id", deleteTask)
router.post("/:id/assign", assignTask)
router.get("/order/:orderId", getTaskByOrderId)
router.get("/customer/:customerId", getTaskByCustomerId)
router.get("/user/:userId", getTaskByUserId)
router.get("/project/:projectId", getTaskByProjectId)
router.put("/:id/assign/:assignmentId", updateTaskAssignment)

export default router
