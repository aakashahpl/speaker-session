import { Router, Request, Response } from 'express';
import { signup,login } from '../controllers/user';


const router = Router();


router.post('/signup',signup);

router.post('/login',login);


export default router;
