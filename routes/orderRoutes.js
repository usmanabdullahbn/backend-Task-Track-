import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrderByCustomerId,
  getOrderById,
  getOrderByProjectId,
  getOrders,
  updateOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.get("/project/:projectId", getOrderByProjectId);
router.get("/customer/:customerId", getOrderByCustomerId);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
