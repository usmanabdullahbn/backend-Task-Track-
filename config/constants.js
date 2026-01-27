export const ROLES = ["admin", "manager", "supervisor", "technician", "employee"];

export const PROJECT_STATUS = ["Active", "In Active", "Completed", "On Hold", "Cancelled"];
export const ORDER_STATUS = [
  "Pending",
  "In Progress", // In Progcess
  "Open",
  "Completed",
  "Cancelled",  
];
export const TASK_STATUS = ["Todo", "In Progress", "Completed", "On Hold"];
export const TASK_PRIORITY = ["Low", "Medium", "High", "Critical"];
export const ASSET_STATUS = ["Active", "Inactive", "Maintenance", "Retired"];
export const EMPLOYEE_STATUS = ["Active", "Inactive", "On Leave"];

// Employee Timeline - Default Office Location
export const DEFAULT_OFFICE_LOCATION = {
  lat:  25.21558,
  lng: 51.45524,
  title: "Head Office",
};
