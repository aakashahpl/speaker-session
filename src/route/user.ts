import { Router, Request, Response } from 'express';
import { signup,login,verifyOtpHandler,createOtp } from '../controllers/user';

const router = Router();


router.post('/auth/signup',signup);

router.post('/auth/login',login);

router.post('/auth/verify-otp', verifyOtpHandler);

router.get('/auth/generate-otp/',createOtp);


export default router;
