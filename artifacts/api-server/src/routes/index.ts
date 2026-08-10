import { Router, type IRouter } from "express";
import healthRouter from "./health";
import uploadsRouter from "./uploads";
import docsRouter from "./docs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(uploadsRouter);
router.use(docsRouter);

export default router;
