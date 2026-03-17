import { Router } from "express";
import { jobsRouter } from "./jobs";
import { companiesRouter } from "./companies";
import { applicationsRouter } from "./applications";
import { usersRouter } from "./users";
import { authRouter } from "./auth";
import { adminRouter } from "./admin";

const router = Router();
router.use("/jobs", jobsRouter);
router.use("/companies", companiesRouter);
router.use("/applications", applicationsRouter);
router.use("/users", usersRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);

export default router;
