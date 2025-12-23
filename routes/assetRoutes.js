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

const router = express.Router()


router.get("/", getAssets)
router.get("/barcode/:barcode", getAssetByBarcode)
router.get("/:id", getAssetById)
router.get("/customer/:customerId", getAssetByCustomerId)
router.get("/employee/:employeeId", getAssetsByEmployeeCustomerId)
router.post("/", createAsset)
router.put("/:id", updateAsset)
router.delete("/:id", deleteAsset)

export default router
