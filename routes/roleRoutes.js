import express from "express"
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignMenuToRole,
} from "../controllers/roleController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/", getRoles)
router.get("/:id", getRoleById)
router.post("/", createRole)
router.put("/:id", updateRole)
router.delete("/:id", deleteRole)
router.post("/:id/menus", assignMenuToRole)

export default router
