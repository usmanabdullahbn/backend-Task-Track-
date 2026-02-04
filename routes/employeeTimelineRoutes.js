import express from "express";
import {
  saveEmployeeTimeline,
  getAllTimelines,
  getTimelineByDate,
  getTimelineByEmployeeId,
  getTimelineByEmployeeIdAndDate,
  updateTaskEndTime,
} from "../controllers/employeeTimelineController.js";

const router = express.Router();

router.post("/timeline", saveEmployeeTimeline);
router.get("/timeline/all", getAllTimelines);
router.get("/timeline/date", getTimelineByDate);
router.get("/timeline/employee", getTimelineByEmployeeId);
router.get("/timeline/employee-date", getTimelineByEmployeeIdAndDate);
router.put("/timeline/end-time", updateTaskEndTime);

export default router;
