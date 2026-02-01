import Order from "../models/Order.js";

export const getOrders = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    let query = {};

    // Search order number or ERP
    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: "i" } },
        { erp_number: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    let ordersQuery = Order.find(query).sort({ created_at: -1 });

    // Apply pagination only if limit is provided
    if (limit) {
      const pageNum = page ? Number(page) : 1;
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;
      ordersQuery = ordersQuery.skip(skip).limit(limitNum);
    }

    const orders = await ordersQuery;

    const total = await Order.countDocuments(query);

    const response = {
      success: true,
      orders,
      total,
    };

    // Include pagination info only if limit was provided
    if (limit) {
      response.page = Number(page) || 1;
      response.pages = Math.ceil(total / Number(limit));
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const orders = await Order.find({ "project.id": projectId }).sort({
      created_at: -1,
    });

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this project" });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const orders = await Order.find({ "customer.id": customerId }).sort({
      created_at: -1,
    });

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this customer" });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByEmployeeCustomerId = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const orders = await Order.find({ "employee.id": employeeId }).sort({
      created_at: -1,
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this employee",
      });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};
export const getOrderByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ "user.id": userId }).sort({
      created_at: -1,
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// Create Order Controller
// =======================
export const createOrder = async (req, res, next) => {
  const generateOrderNumber = async () => {
    const lastOrder = await Order.findOne().sort({ created_at: -1 });
    console.log(lastOrder);

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
      user,
      project,
      erp_number,
      title,
      amount,
      order_date,
      delivery_date,
      public_link,
      notes,
    } = req.body;

    // Handle multiple file uploads
    let fileUploads = []
    if (req.files) {
      // Handle different possible field names
      const allFiles = []
      if (req.files.files) allFiles.push(...req.files.files)
      if (req.files.file_upload) allFiles.push(...req.files.file_upload)
      if (req.files['files[]']) allFiles.push(...req.files['files[]'])

      if (allFiles.length > 0) {
        fileUploads = allFiles.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${file.filename}` // URL path for accessing the file
        }))
      }
    }

    const order_number = await generateOrderNumber();

    const order = await Order.create({
      customer,
      employee,
      user,
      project,
      title,
      order_number,
      erp_number,
      amount,
      order_date,
      delivery_date,
      file_upload: fileUploads, // Store array of file objects
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const {
      customer,
      user,
      project,
      employee,
      // order_number,
      title,
      erp_number,
      amount,
      order_date,
      delivery_date,
      public_link,
      status,
      notes,
    } = req.body;

    if (customer) order.customer = customer;
    if (user) order.user = user;
    if (project) order.project = project;
    if (employee) order.employee = employee;

    if (title) order.title = title;
    // if (order_number) order.order_number = order_number
    if (erp_number) order.erp_number = erp_number;
    if (amount) order.amount = amount;
    if (order_date) order.order_date = order_date;
    if (delivery_date) order.delivery_date = delivery_date;

    // Handle multiple file uploads - append to existing files if any
    if (req.files) {
      const allFiles = []
      if (req.files.files) allFiles.push(...req.files.files)
      if (req.files.file_upload) allFiles.push(...req.files.file_upload)
      if (req.files['files[]']) allFiles.push(...req.files['files[]'])

      if (allFiles.length > 0) {
        const newFileUploads = allFiles.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${file.filename}`
        }))

        // Merge with existing files or create new array
        order.file_upload = order.file_upload ? [...order.file_upload, ...newFileUploads] : newFileUploads
      }
    }

    if (public_link) order.public_link = public_link;
    if (status) order.status = status;
    if (notes) order.notes = notes;

    order.modified_at = new Date();
    order.modified_user = req.body.userId;

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
