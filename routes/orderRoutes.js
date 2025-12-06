import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrderByCustomerId,
  getOrderById,
  getOrderByProjectId,
  getOrderByUserId,
  getOrders,
  updateOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.get("/project/:projectId", getOrderByProjectId);
router.get("/customer/:customerId", getOrderByCustomerId);
router.get("/user/:userId", getOrderByUserId);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
