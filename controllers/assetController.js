import Asset from "../models/Asset.js"

// -----------------------------------------------------
// GET ALL ASSETS
// -----------------------------------------------------
export const getAssets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query
    const skip = (page - 1) * limit

    let query = {}

    // SEARCH
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { serial_number: { $regex: search, $options: "i" } }
      ]
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

    res.status(200).json({ success: true, asset })
  } catch (error) {
    next(error)
  }
}

export const getAssetByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params

    // Ensure string comparison
    const assets = await Asset.find({ "customer.id": String(customerId) }).sort({ created_at: -1 })

    if (!assets.length) {
      return res.status(404).json({ message: "No assets found for this customer" })
    }

    res.status(200).json({
      success: true,
      assets,
    })
  } catch (error) {
    next(error)
  }
}

export const getAssetsByEmployeeCustomerId = async (req, res, next) => {
  try {
    const { employeeId } = req.params

    const assets = await Asset.find({ "employee.id": employeeId }).sort({
      created_at: -1,
    })

    if (!assets || assets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No assets found for this employee",
      })
    }

    res.status(200).json({
      success: true,
      assets,
    })
  } catch (error) {
    next(error)
  }
}

export const getAssetByEmployeeCustomerId = async (req, res, next) => {
  try {
    const { employeeId } = req.params

    // Ensure string comparison
    const assets = await Asset.find({ "employee.id": String(employeeId) }).sort({ created_at: -1 })

    if (!assets.length) {
      return res.status(404).json({ message: "No assets found for this customer" })
    }

    res.status(200).json({
      success: true,
      assets,
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
      order_id,
      order_number,

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
      order: { id: order_id, order_number },

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
      order_id,
      order_number,

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

    // update nested fields only when provided
    if (customer_id || customer_name)
      asset.customer = { id: customer_id ?? asset.customer.id, name: customer_name ?? asset.customer.name }

    if (employee_id || employee_name)
      asset.employee = { id: employee_id ?? asset.employee.id, name: employee_name ?? asset.employee.name }

    if (project_id || project_name)
      asset.project = { id: project_id ?? asset.project.id, name: project_name ?? asset.project.name }

    if (order_id || order_number)
      asset.order = { id: order_id ?? asset.order.id, order_number: order_number ?? asset.order.order_number }

    // normal fields
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
    res.status(200).json({ success: true, message: "Asset deleted successfully" })
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

    if (!asset) return res.status(404).json({ message: "Asset not found" })

    res.status(200).json({ success: true, asset })
  } catch (error) {
    next(error)
  }
}
