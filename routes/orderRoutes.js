import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrderByCustomerId,
  getOrderById,
  getOrderByProjectId,
  getOrderByUserId,
  getOrders,
  getOrdersByEmployeeCustomerId,
  updateOrder,
} from "../controllers/orderController.js";
import { uploadMultiple } from "../config/multer.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.get("/project/:projectId", getOrderByProjectId);
router.get("/customer/:customerId", getOrderByCustomerId);
router.get("/user/:userId", getOrderByUserId);
router.get("/employee/:employeeId", getOrdersByEmployeeCustomerId);
router.post("/", uploadMultiple, createOrder);
router.put("/:id", uploadMultiple, updateOrder);
router.delete("/:id", deleteOrder);

export default router;
