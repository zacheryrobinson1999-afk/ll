import { Router, type IRouter } from "express";
import healthRouter from "./health";
import docsRouter from "./docs";
import authRouter from './auth';
import daycodesRouter from './daycodes';
import adminRouter from './admin';
import notesRouter from './notes';
import diaryRouter from './diary';
import workflowRouter from './workflow';

const router: IRouter = Router();

router.use(healthRouter);
router.use(docsRouter);
router.use(authRouter);
router.use(daycodesRouter);
router.use(adminRouter);
router.use(notesRouter);
router.use(diaryRouter);
router.use(workflowRouter);

export default router;
