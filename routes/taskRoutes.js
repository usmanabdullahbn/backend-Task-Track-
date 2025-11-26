import express from "express"
import {
  assignTask,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskAssignment,
} from "../controllers/taskController.js"

const router = express.Router()


router.get("/", getTasks)
router.get("/:id", getTaskById)
router.post("/", createTask)
router.put("/:id", updateTask)
router.delete("/:id", deleteTask)
router.post("/:id/assign", assignTask)
router.put("/:id/assign/:assignmentId", updateTaskAssignment)

export default router
