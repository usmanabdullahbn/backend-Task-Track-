import User from "../models/User.js";
import dns from "dns/promises";
import mongoose from "mongoose";

export const getUsers = async (req, res, next) => {
  // I WANT PASS ALSO IN THE RESPONSE
  try {
    const { search } = req.query;

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

    const Users = await User.find(query)
      .sort({ created_at: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      Users,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const users = await User.find({ "customer.id": customerId }).sort({
      created_at: -1,
    });

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found for this customer",
      });
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      designation,
      role,
      phone,
      asset_id,
      order_id,
      project_id,
      customer_id,
      customer,
    } = req.body;

    // 1️⃣ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Only one user allowed per email.",
      });
    }

    // 2️⃣ Generate new code like T101, T102, T103 ...
    const lastUser = await User.findOne()
      .sort({ created_at: -1 })
      .select("code");

    let newCode = "T101";
    if (lastUser && lastUser.code) {
      const lastNumber = parseInt(lastUser.code.replace("T", ""), 10);
      newCode = `T${lastNumber + 1}`;
    }

    // 3️⃣ Generate password
    const plainPassword = `123${name.replace(/\s+/g, "").toLowerCase()}`;

    // 4️⃣ Create user document
    const userDoc = await User.create({
      name,
      email,
      designation,
      role,
      customer,
      phone,
      asset_id,
      order_id,
      project_id,
      customer_id,
      password: plainPassword,
      code: newCode,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      password: plainPassword, // only once
      user: userDoc,
    });
  } catch (error) {
    next(error);
  }
};

export const validateUserEmailMailbox = async (req, res, next) => {
  try {
    const rawEmail = req.body?.email;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const ignoreUserId = req.body?.ignoreUserId;

    if (!email) {
      return res.status(400).json({
        success: false,
        mailboxExists: false,
        status: "invalid",
        message: "Email is required",
      });
    }

    const emailRe = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailRe.test(email)) {
      return res.status(200).json({
        success: true,
        mailboxExists: false,
        status: "invalid",
        message: "Please provide a valid email",
      });
    }

    const duplicateQuery = { email };
    if (ignoreUserId && mongoose.Types.ObjectId.isValid(ignoreUserId)) {
      duplicateQuery._id = { $ne: ignoreUserId };
    }
    const existingUser = await User.findOne(duplicateQuery).select("_id");
    if (existingUser) {
      return res.status(200).json({
        success: true,
        mailboxExists: false,
        status: "invalid",
        message: "Email already exists. Only one user allowed per email.",
      });
    }

    const domain = email.split("@")[1];

    let mxRecords = [];
    try {
      mxRecords = await dns.resolveMx(domain);
    } catch (mxError) {
      mxRecords = [];
    }

    if (!Array.isArray(mxRecords) || mxRecords.length === 0) {
      return res.status(200).json({
        success: true,
        mailboxExists: false,
        status: "invalid",
        message: "Mailbox is undeliverable (domain has no MX records).",
      });
    }

    return res.status(200).json({
      success: true,
      mailboxExists: true,
      status: "deliverable",
      message: "Mailbox verified.",
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      designation,
      role,
      phone,
      asset_id,
      order_id,
      project_id,
      customer_id,
      status,
      is_active,
      regenerateCode, // OPTIONAL → if true, will create next T-series code
    } = req.body;

    let userDoc = await User.findById(req.params.id);

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⚠️ If email is changed → check duplicate
    if (email && email !== userDoc.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "This email already exists",
        });
      }
    }

    // 🔄 Update fields only if provided
    if (name) userDoc.name = name;
    if (email) userDoc.email = email;
    if (password) userDoc.password = password;
    if (designation) userDoc.designation = designation;
    if (role) userDoc.role = role;
    if (phone) userDoc.phone = phone;

    if (asset_id) userDoc.asset_id = asset_id;
    if (order_id) userDoc.order_id = order_id;
    if (project_id) userDoc.project_id = project_id;
    if (customer_id) userDoc.customer_id = customer_id;

    if (status) userDoc.status = status;
    if (is_active !== undefined) userDoc.is_active = is_active;

    // 🔢 OPTIONAL → Regenerate Employee Code T101, T102...
    if (regenerateCode === true) {
      const lastUser = await User.findOne()
        .sort({ created_at: -1 })
        .select("code");

      let newCode = "T101";
      if (lastUser && lastUser.code) {
        const lastNumber = parseInt(lastUser.code.replace("T", ""), 10);
        newCode = `T${lastNumber + 1}`;
      }

      userDoc.code = newCode;
    }

    userDoc.modified_at = new Date();

    await userDoc.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userDoc,
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }

    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    user.modified_at = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find User with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password directly (no hashing in your setup)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "user deleted successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
