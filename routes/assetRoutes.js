import express from "express"
import {
  createAsset,
  deleteAsset,
  getAssetByBarcode,
  getAssetById,
  getAssets,
  updateAsset,
} from "../controllers/assetController.js"

const router = express.Router()


router.get("/", getAssets)
router.get("/barcode/:barcode", getAssetByBarcode)
router.get("/:id", getAssetById)
router.post("/", createAsset)
router.put("/:id", updateAsset)
router.delete("/:id", deleteAsset)

export default router
