import { Router, type IRouter } from "express";
import healthRouter from "./health";
import docsRouter from "./docs";
import authRouter from './auth';
import daycodesRouter from './daycodes';

const router: IRouter = Router();

router.use(healthRouter);
router.use(docsRouter);
router.use(authRouter);
router.use(daycodesRouter);

export default router;
