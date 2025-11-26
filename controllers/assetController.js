import Asset from "../models/Asset.js"

export const getAssets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query
    const skip = (page - 1) * limit

    let query = {}
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { barcode: { $regex: search, $options: "i" } },
          { serial_number: { $regex: search, $options: "i" } },
        ],
      }
    }
    if (status) query.status = status
    if (category) query.category = category

    const assets = await Asset.find(query)
      .populate("project_id")
      .populate("customer_id")
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ created_at: -1 })

    const total = await Asset.countDocuments(query)

    res.status(200).json({
      success: true,
      assets,
      total,
      page: Number.parseInt(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}

export const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate("project_id")
      .populate("customer_id")
      .populate("order_id")

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" })
    }

    res.status(200).json({
      success: true,
      asset,
    })
  } catch (error) {
    next(error)
  }
}

export const createAsset = async (req, res, next) => {
  try {
    const {
      order_id,
      project_id,
      customer_id,
      title,
      description,
      model,
      manufacturer,
      serial_number,
      category,
      barcode,
      file_upload,
      location,
    } = req.body

    const asset = await Asset.create({
      order_id,
      project_id,
      customer_id,
      title,
      description,
      model,
      manufacturer,
      serial_number,
      category,
      barcode,
      file_upload,
      location,
      created_user: req.body.userId,
    })

    res.status(201).json({
      success: true,
      asset,
    })
  } catch (error) {
    next(error)
  }
}

export const updateAsset = async (req, res, next) => {
  try {
    const {
      order_id,
      project_id,
      customer_id,
      title,
      description,
      model,
      manufacturer,
      serial_number,
      category,
      barcode,
      file_upload,
      status,
      location,
    } = req.body

    const asset = await Asset.findById(req.params.id)

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" })
    }

    if (order_id) asset.order_id = order_id
    if (project_id) asset.project_id = project_id
    if (customer_id) asset.customer_id = customer_id
    if (title) asset.title = title
    if (description) asset.description = description
    if (model) asset.model = model
    if (manufacturer) asset.manufacturer = manufacturer
    if (serial_number) asset.serial_number = serial_number
    if (category) asset.category = category
    if (barcode) asset.barcode = barcode
    if (file_upload) asset.file_upload = file_upload
    if (status) asset.status = status
    if (location) asset.location = location

    asset.modified_at = new Date()
    asset.modified_user = req.body.userId

    await asset.save()

    res.status(200).json({
      success: true,
      asset,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAsset = async (req, res, next) => {
  try {
    await Asset.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getAssetByBarcode = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ barcode: req.params.barcode })

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" })
    }

    res.status(200).json({
      success: true,
      asset,
    })
  } catch (error) {
    next(error)
  }
}
