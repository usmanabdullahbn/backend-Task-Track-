import Customer from "../models/Customer.js";

export const getCustomers = async (req, res, next) => {
  // I WANT PASS ALSO IN THE RESPONSE
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Only apply search if user typed something
    if (search && search.trim() !== "") {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } }, // Correct field name
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
    }

    const customers = await Customer.find(query)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ created_at: -1 });

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      customers,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const {
      name,
      address,
      fax,
      phone,
      email,
      latitude,
      longitude,
    } = req.body;

    // 1️⃣ Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Only one customer allowed per email.",
      });
    }

    // 2️⃣ Generate password
    const plainPassword = `123${name.replace(/\s+/g, "").toLowerCase()}`;

    // 3️⃣ Create customer
    const customer = await Customer.create({
      name,
      address,
      phone,
      fax,
      email,
      latitude,
      longitude,
      password: plainPassword,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      password: plainPassword, // show only once
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const {
      name,
      address,
      phone,
      fax,
      email,
      latitude,
      longitude,
      is_active,
    } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (name) customer.name = name;
    if (address) customer.address = address;
    if (phone) customer.phone = phone;
    if (fax) customer.fax = fax;
    if (email) customer.email = email;
    if (latitude) customer.latitude = latitude;
    if (longitude) customer.longitude = longitude;
    if (is_active !== undefined) customer.is_active = is_active;

    customer.modified_at = new Date();

    await customer.save();

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};
export const changeCustomerPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }

    const customer = await Customer.findById(req.params.id).select("+password");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }


    customer.password = newPassword;
    customer.modified_at = new Date();

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find customer with password field
    const customer = await Customer.findOne({ email }).select("+password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Compare password directly (no hashing in your setup)
    if (customer.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Remove password from response
    customer.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      customer,
    });

  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    
    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
