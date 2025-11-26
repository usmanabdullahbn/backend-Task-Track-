import express from "express";
import {
  getUsers,
  createUser,
  loginUser,
  getUserById,
  updateUser,
  changeUserPassword,
  deleteUser
} from "../controllers/userController.js";




const router = express.Router();


router.get("/", getUsers);
router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.put("/:id/change-password", changeUserPassword);
router.delete("/:id", deleteUser);

export default router;
