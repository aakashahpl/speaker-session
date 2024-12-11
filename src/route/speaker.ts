import { Router, Request, Response } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth';
import {newProfile, getAllSpeakers} from '../controllers/speaker';

const router = Router();

router.post('/create-profile',verifyRole(['speaker']), newProfile);

router.get('/fetch-all',verifyToken,getAllSpeakers);

export default router;
