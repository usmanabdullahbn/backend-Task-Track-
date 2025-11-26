import express from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} from "../controllers/projectController.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);


export default router;
