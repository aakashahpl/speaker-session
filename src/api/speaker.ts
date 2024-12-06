import { Router, Request, Response } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth';
import {newProfile, getAllSpeakers} from '../controllers/speaker';

const router = Router();

router.post('/profile',verifyRole(['speaker']), newProfile);

router.get('/fetch',verifyToken,getAllSpeakers);

export default router;
