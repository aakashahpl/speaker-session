import { Router, Request, Response } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth';
import {bookSlot} from '../controllers/booking';

const router = Router();

router.post('/',verifyRole(['user']),bookSlot );

export default router;
