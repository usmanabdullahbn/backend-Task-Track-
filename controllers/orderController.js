import Order from "../models/Order.js"

export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
    const skip = (page - 1) * limit

    let query = {}

    // Search order number or ERP
    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: "i" } },
        { erp_number: { $regex: search, $options: "i" } }
      ]
    }

    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 })

    const total = await Order.countDocuments(query)

    res.status(200).json({
      success: true,
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

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

export const getOrderByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.params

    const orders = await Order.find({ "project.id": projectId }).sort({ created_at: -1 })

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this project" })
    }

    res.status(200).json({
      success: true,
      orders,
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params

    const orders = await Order.find({ "customer.id": customerId }).sort({ created_at: -1 })

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this customer" })
    }

    res.status(200).json({
      success: true,
      orders,
    })
  } catch (error) {
    next(error)
  }
}



// =======================
// Create Order Controller
// =======================
export const createOrder = async (req, res, next) => {

  const generateOrderNumber = async () => {
    const lastOrder = await Order.findOne().sort({ created_at: -1 });
    console.log(lastOrder)

    let nextNumber = 1;

    if (lastOrder && lastOrder.order_number) {
      const parts = lastOrder.order_number.split("-");
      const numericPart = parseInt(parts[1]);

      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    return `ORD-${String(nextNumber).padStart(3, "0")}`;
  };

  try {
    const {
      customer,
      employee,
      project,
      erp_number,
      title,
      amount,
      order_date,
      delivery_date,
      file_upload,
      public_link,
      notes,
    } = req.body;

    const order_number = await generateOrderNumber();

    const order = await Order.create({
      customer,
      employee,
      project,
      title,
      order_number,
      erp_number,
      amount,
      order_date,
      delivery_date,
      file_upload,
      public_link,
      notes,
      created_user: req.body.userId,
    });

    res.status(201).json({
      success: true,
      order,
    });
    
  } catch (error) {
    next(error);
  }
};



export const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const {
      customer,
      employee,
      project,
      // order_number,
      title,
      erp_number,
      amount,
      order_date,
      delivery_date,
      file_upload,
      public_link,
      status,
      notes,
    } = req.body

    if (customer) order.customer = customer
    if (employee) order.employee = employee
    if (project) order.project = project

    if (title) order.title = title
    // if (order_number) order.order_number = order_number
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
