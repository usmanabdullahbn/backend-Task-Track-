import express from "express";
import {
  saveEmployeeTimeline,
  getAllTimelines,
  getTimelineByDate,
  getTimelineByEmployeeId,
  getTimelineByEmployeeIdAndDate,
} from "../controllers/employeeTimelineController.js";

const router = express.Router();

router.post("/timeline", saveEmployeeTimeline);
router.get("/timeline/all", getAllTimelines);
router.get("/timeline/date", getTimelineByDate);
router.get("/timeline/employee", getTimelineByEmployeeId);
router.get("/timeline/employee-date", getTimelineByEmployeeIdAndDate);

export default router;
