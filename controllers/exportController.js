import * as XLSX from 'xlsx';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import Order from '../models/Order.js';
import Asset from '../models/Asset.js';
import Task from '../models/Task.js';
import TaskAssignment from '../models/TaskAssignment.js';
import TaskVisit from '../models/TaskVisit.js';
import EmployeeTimeline from '../models/EmployeeTimeline.js';
import IdleLog from '../models/IdleLog.js';
import LocationPoint from '../models/LocationPoint.js';
import WorkSession from '../models/WorkSession.js';

const exportAllData = async (req, res) => {
  try {
    // Fetch all data from each model
    const users = await User.find({}).lean();
    const customers = await Customer.find({}).lean();
    const projects = await Project.find({}).lean();
    const orders = await Order.find({}).lean();
    const assets = await Asset.find({}).lean();
    const tasks = await Task.find({}).lean();
    const taskAssignments = await TaskAssignment.find({}).lean();
    const taskVisits = await TaskVisit.find({}).lean();
    const employeeTimelines = await EmployeeTimeline.find({}).lean();
    const idleLogs = await IdleLog.find({}).lean();
    const locationPoints = await LocationPoint.find({}).lean();
    const workSessions = await WorkSession.find({}).lean();

    // Debug check
    console.log("Users:", users.length);
    console.log("Customers:", customers.length);
    console.log("Projects:", projects.length);
    console.log("Orders:", orders.length);
    console.log("Assets:", assets.length);
    console.log("Tasks:", tasks.length);
    console.log("TaskAssignments:", taskAssignments.length);
    console.log("TaskVisits:", taskVisits.length);
    console.log("EmployeeTimelines:", employeeTimelines.length);
    console.log("IdleLogs:", idleLogs.length);
    console.log("LocationPoints:", locationPoints.length);
    console.log("WorkSessions:", workSessions.length);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

// Function to add sheet with formatting
const addSheet = (data, sheetName, workbook) => {
  if (data.length > 0) {
    // Convert ObjectIds and nested objects
    const cleanData = data.map(item =>
      JSON.parse(JSON.stringify(item))
    );

    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    
    // Set column widths
    const colWidths = Object.keys(cleanData[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
    worksheet['!cols'] = colWidths;
    
    // Style the header row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFD3D3D3" } }
      };
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
};

    // Add sheets for each model
    addSheet(users, 'Users', workbook);
    addSheet(customers, 'Customers', workbook);
    addSheet(projects, 'Projects', workbook);
    addSheet(orders, 'Orders', workbook);
    addSheet(assets, 'Assets', workbook);
    addSheet(tasks, 'Tasks', workbook);
    addSheet(taskAssignments, 'TaskAssignments', workbook);
    addSheet(taskVisits, 'TaskVisits', workbook);
    addSheet(employeeTimelines, 'EmployeeTimelines', workbook);
    addSheet(idleLogs, 'IdleLogs', workbook);
    addSheet(locationPoints, 'LocationPoints', workbook);
    addSheet(workSessions, 'WorkSessions', workbook);

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });

    // Set headers for download
    res.setHeader('Content-Disposition', 'attachment; filename="all_data.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
};

export { exportAllData };