import Order from "../models/Order.js"

export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
    const skip = (page - 1) * limit

    let query = {}
    if (search) {
      query = {
        $or: [{ order_number: { $regex: search, $options: "i" } }, { erp_number: { $regex: search, $options: "i" } }],
      }
    }
    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate("project_id")
      .populate("customer_id")
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ created_at: -1 })

    const total = await Order.countDocuments(query)

    res.status(200).json({
      success: true,
      orders,
      total,
      page: Number.parseInt(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("project_id").populate("customer_id")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error) {
    next(error)
  }
}

export const createOrder = async (req, res, next) => {
  try {
    const {
      project_id,
      customer_id,
      order_number,
      erp_number,
      amount,
      order_date,
      delivery_date,
      file_upload,
      public_link,
      notes,
    } = req.body

    const order = await Order.create({
      project_id,
      customer_id,
      order_number,
      erp_number,
      amount,
      order_date,
      delivery_date,
      file_upload,
      public_link,
      notes,
      created_user: req.body.userId,
    })

    res.status(201).json({
      success: true,
      order,
    })
  } catch (error) {
    next(error)
  }
}

export const updateOrder = async (req, res, next) => {
  try {
    const {
      project_id,
      customer_id,
      order_number,
      erp_number,
      amount,
      order_date,
      delivery_date,
      file_upload,
      public_link,
      status,
      notes,
    } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (project_id) order.project_id = project_id
    if (customer_id) order.customer_id = customer_id
    if (order_number) order.order_number = order_number
    if (erp_number) order.erp_number = erp_number
    if (amount) order.amount = amount
    if (order_date) order.order_date = order_date
    if (delivery_date) order.delivery_date = delivery_date
    if (file_upload) order.file_upload = file_upload
    if (public_link) order.public_link = public_link
    if (status) order.status = status
    if (notes) order.notes = notes

    order.modified_at = new Date()
    order.modified_user = req.body.userId

    await order.save()

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteOrder = async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}
