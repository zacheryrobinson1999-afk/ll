import { Router, type IRouter } from "express";
import healthRouter from "./health";
import docsRouter from "./docs";
import authRouter from './auth';
import daycodesRouter from './daycodes';
import adminRouter from './admin';
import notesRouter from './notes';
import diaryRouter from './diary';

const router: IRouter = Router();

router.use(healthRouter);
router.use(docsRouter);
router.use(authRouter);
router.use(daycodesRouter);
router.use(adminRouter);
router.use(notesRouter);
router.use(diaryRouter);

export default router;
