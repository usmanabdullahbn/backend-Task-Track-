import express from "express";
import {
  getUsers,
  createUser,
  loginUser,
  getUserById,
  updateUser,
  changeUserPassword,
  deleteUser,
  getUsersByCustomerId
} from "../controllers/userController.js";




const router = express.Router();


router.get("/", getUsers);
router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/:id", getUserById);
router.get("/customer/:customerId", getUsersByCustomerId);
router.put("/:id", updateUser);
router.put("/:id/change-password", changeUserPassword);
router.delete("/:id", deleteUser);

export default router;
