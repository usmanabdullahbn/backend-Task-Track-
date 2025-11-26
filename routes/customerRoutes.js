import express from "express";
import {
  changeCustomerPassword,
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  loginCustomer,
  updateCustomer,
} from "../controllers/customerController.js";

const router = express.Router();


router.get("/", getCustomers);
router.post("/create", createCustomer);
router.post("/login", loginCustomer);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.put("/:id/change-password", changeCustomerPassword);
router.delete("/:id", deleteCustomer);

export default router;
