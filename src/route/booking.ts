import { Router, Request, Response } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth';
import {bookSlot,freeSlots, speakerBookings} from '../controllers/booking';

const router = Router();

router.post('/create',verifyRole(['user']),bookSlot);

router.get('/fetch',verifyRole(['speaker']),speakerBookings);

router.get('/free-slots/:speakerId',verifyRole(['speaker','user']),freeSlots);

export default router;
