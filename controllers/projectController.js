import Project from "../models/Project.js";

// ============================
// GET ALL PROJECTS
// ============================
export const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, employeeId } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    // NEW: Filter by employee.id if provided
    if (employeeId) {
      query["employee.id"] = employeeId;
    }

    const projects = await Project.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 });

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      projects,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// GET PROJECT BY ID
// ============================
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// GET PROJECTS BY CUSTOMER ID
// ============================
export const getProjectsByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const projects = await Project.find({ "customer.id": customerId }).sort({
      created_at: -1,
    });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found for this customer",
      });
    }

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectsByEmployeeCustomerId = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const projects = await Project.find({ "employee.id": employeeId }).sort({
      created_at: -1,
    });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found for this employee",
      });
    }

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// CREATE PROJECT
// ============================
export const createProject = async (req, res, next) => {
  try {
    const {
      customer, // { id, name }
      employee, // NEW → { id, name }
      title,
      map_location,
      contact_name,
      contact_phone,
      contact_email,
      description,
      file_upload,
      latitude,
      longitude,
      start_date,
      end_date,
      budget,
    } = req.body;

    const project = await Project.create({
      customer,
      employee, // NEW FIELD
      title,
      map_location,
      contact_name,
      contact_phone,
      contact_email,
      description,
      file_upload,
      latitude,
      longitude,
      start_date,
      end_date,
      budget,
      created_user: req.body.userId,
    });

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// UPDATE PROJECT
// ============================
export const updateProject = async (req, res, next) => {
  try {
    const {
      customer, // contains id + name if changed
      employee, // NEW handling
      title,
      map_location,
      contact_name,
      contact_phone,
      contact_email,
      description,
      file_upload,
      latitude,
      longitude,
      status,
      start_date,
      end_date,
      budget,
    } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (customer) project.customer = customer;
    if (employee) project.employee = employee; // NEW
    if (title) project.title = title;
    if (map_location) project.map_location = map_location;
    if (contact_name) project.contact_name = contact_name;
    if (contact_phone) project.contact_phone = contact_phone;
    if (contact_email) project.contact_email = contact_email;
    if (description) project.description = description;
    if (file_upload) project.file_upload = file_upload;
    if (latitude) project.latitude = latitude;
    if (longitude) project.longitude = longitude;
    if (status) project.status = status;
    if (start_date) project.start_date = start_date;
    if (end_date) project.end_date = end_date;
    if (budget) project.budget = budget;

    project.modified_at = new Date();
    project.modified_user = req.body.userId;

    await project.save();

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// DELETE PROJECT
// ============================
export const deleteProject = async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
