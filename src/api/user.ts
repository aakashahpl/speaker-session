import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import db from '../utils/db'; 
import { RowDataPacket } from 'mysql2';
import jwt from "jsonwebtoken";

const router = Router();



router.post('/signup', async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, user_type } = req.body;

    if (!first_name || !validator.isLength(first_name, { min: 1 })) {
        return res.status(400).json({ message: 'First name is required' });
    }
    if (!last_name || !validator.isLength(last_name, { min: 1 })) {
        return res.status(400).json({ message: 'Last name is required' });
    }
    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!password || !validator.isLength(password, { min: 6 })) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    if (!user_type || !['user', 'speaker'].includes(user_type)) {
        return res.status(400).json({ message: 'Invalid user type' });
    }

    try {
        // Check if email already exists
        const [existingUser] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length!=0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

      
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password, user_type) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, user_type]
        );

        const userId = (result as any).insertId;

        if (user_type === 'speaker') {
            await db.query('INSERT INTO speakers (user_id) VALUES (?)', [userId]);
        }

      
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: userId,
                first_name,
                last_name,
                email,
                user_type,
                is_verified: false
            }
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/login',async(req:Request,res:Response)=>{
    const {email,password} = req.body;
    console.log(req.body);
    if(!email||!password){
        return res.status(400).json({message:"email and password are required"});
    }
    try {
        const [rows] =await  db.query<RowDataPacket[]>("select * from users where email = ?",[email]);
        if(rows.length==0){
            return res.status(400).json({message:'Email does not exist'});
        }
        const user = rows[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        
        if(isPasswordMatch){
            const payload = {
                id: user.id,
                email: user.email,
                role: user.user_type, 
            };

            // Generate the JWT
            const JWT_Secret = process.env.JWT_SECRET;
            if(!JWT_Secret){
                console.log("secret missing from env file");
            }
            const token = jwt.sign(payload, JWT_Secret, { expiresIn: "1h" });

            return res.status(200).json({ message: "Login successful", token:token });
        }else{
            return res.status(400).json({message:'invalid password'});
        }

    } catch (error) {
       res.status(500).json({message:'server error'});
    }
})



export default router;
