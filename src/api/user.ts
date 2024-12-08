import { Router, Request, Response } from 'express';
import { signup,login,verifyOtpHandler } from '../controllers/user';


const router = Router();


router.post('/signup',signup);

router.post('/login',login);

router.post('/verify-otp', verifyOtpHandler);


export default router;
