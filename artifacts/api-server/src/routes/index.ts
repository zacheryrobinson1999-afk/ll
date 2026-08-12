import { Router, type IRouter } from "express";
import healthRouter from "./health";
import uploadsRouter from "./uploads";
import docsRouter from "./docs";
import authRouter from './auth';

const router: IRouter = Router();

router.use(healthRouter);
router.use(uploadsRouter);
router.use(docsRouter);
router.use(authRouter);

export default router;
