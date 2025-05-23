import { Router } from "express";
import AdminNewsController from "../controllers/admin/NewsController.js";
import AdminForumController from "../controllers/admin/ForumController.js";
import AdminUserController from "../controllers/admin/UserController.js";
import AdminReportController from "../controllers/admin/ReportController.js";
import AdminFeedbackController from "../controllers/admin/FeedbackController.js";
import AdminLogController from "../controllers/admin/LogController.js";
import AdminActivityController from "../controllers/admin/ActivityController.js";
import UploadController from "../controllers/UploadController.js";

const router = Router();

router.get("/news", AdminNewsController.get);
router.post("/news", AdminNewsController.create);
router.put("/news", AdminNewsController.update);
router.patch("/news", AdminNewsController.update);
router.delete("/news", AdminNewsController.delete);

router.get("/forums", AdminForumController.get);
router.get("/forums/appreciation", AdminForumController.getAppreciations);
router.get("/forums/comments", AdminForumController.getComments);
router.delete("/forums", AdminForumController.delete);
router.delete("/forums/comments", AdminForumController.deleteComment);

router.get("/users", AdminUserController.get);
router.delete("/users", AdminUserController.delete);

router.get("/report/forums", AdminReportController.Forum_.get);
router.put(
  "/report/forums",
  AdminReportController.Forum_.updateStatusAndPriority
);
router.patch(
  "/report/forums",
  AdminReportController.Forum_.updateStatusAndPriority
);

router.get("/feedback", AdminFeedbackController.get);
router.put("/feedback", AdminFeedbackController.updateStatus);
router.patch("/feedback", AdminFeedbackController.updateStatus);

router.get("/logs", AdminLogController.get);
router.get("/activity", AdminActivityController.get);

router.post("/upload-max-size-image-change", UploadController.changeMaxSizeKb)

export const AdminRouter = router;
