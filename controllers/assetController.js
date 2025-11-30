import Asset from "../models/Asset.js"

// -----------------------------------------------------
// GET ALL ASSETS
// -----------------------------------------------------
export const getAssets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query
    const skip = (page - 1) * limit

    let query = {}

    // Search
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
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 })

    const total = await Asset.countDocuments(query)

    res.status(200).json({
      success: true,
      assets,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}

// -----------------------------------------------------
// GET ASSET BY ID
// -----------------------------------------------------
export const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)

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

// -----------------------------------------------------
// CREATE ASSET
// -----------------------------------------------------
export const createAsset = async (req, res, next) => {
  try {
    const {
      customer_id,
      customer_name,
      employee_id,
      employee_name,
      project_id,
      project_name,
      task_id,
      task_name,
      order_id,
      order_name,

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
      customer: { id: customer_id, name: customer_name },
      employee: { id: employee_id, name: employee_name },
      project: { id: project_id, name: project_name },
      task: { id: task_id, name: task_name },
      order: { id: order_id, name: order_name },

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

// -----------------------------------------------------
// UPDATE ASSET
// -----------------------------------------------------
export const updateAsset = async (req, res, next) => {
  try {
    const {
      customer_id,
      customer_name,
      employee_id,
      employee_name,
      project_id,
      project_name,
      task_id,
      task_name,
      order_id,
      order_name,

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

    // Update nested objects
    if (customer_id || customer_name)
      asset.customer = { id: customer_id, name: customer_name }

    if (employee_id || employee_name)
      asset.employee = { id: employee_id, name: employee_name }

    if (project_id || project_name)
      asset.project = { id: project_id, name: project_name }

    if (task_id || task_name)
      asset.task = { id: task_id, name: task_name }

    if (order_id || order_name)
      asset.order = { id: order_id, name: order_name }

    // Update normal fields
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

// -----------------------------------------------------
// DELETE ASSET
// -----------------------------------------------------
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

// -----------------------------------------------------
// GET ASSET BY BARCODE
// -----------------------------------------------------
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
