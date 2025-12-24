import express from "express"
import {
  createAsset,
  deleteAsset,
  getAssetByBarcode,
  getAssetByCustomerId,
  getAssetById,
  getAssets,
  getAssetsByEmployeeCustomerId,
  updateAsset,
} from "../controllers/assetController.js"
import { uploadMultiple } from "../config/multer.js"

const router = express.Router()


router.get("/", getAssets)
router.get("/barcode/:barcode", getAssetByBarcode)
router.get("/:id", getAssetById)
router.get("/customer/:customerId", getAssetByCustomerId)
router.get("/employee/:employeeId", getAssetsByEmployeeCustomerId)
router.post("/", uploadMultiple, createAsset)
router.put("/:id", uploadMultiple, updateAsset)
router.delete("/:id", deleteAsset)

export default router
