import User from "../models/User.js";

export const getUsers = async (req, res, next) => {
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

    const Users = await User.find(query)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ created_at: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      Users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
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

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      designation,
      role,
      asset_id,
      order_id,
      project_id,
      customer_id,
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

export const updateUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      designation,
      role,
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
    if (designation) userDoc.designation = designation;
    if (role) userDoc.role = role;

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
