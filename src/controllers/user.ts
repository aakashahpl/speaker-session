import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import db from '../utils/db'; 
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import dotenv from "dotenv";
import { sendMail } from '../utils/mailservice';
import { generateOtp,generateOtpHash } from '../utils/otp';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req: Request, res: Response) => {
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
        const [existingUser] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length !== 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password, user_type) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, user_type]
        );

        const userId = (result as any).insertId;
        
        // send otp for email verification and include the hash in the response

        const { hash, expiresAt } = await generateOtp(email); 

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: userId,
                first_name,
                last_name,
                email,
                user_type,
                is_verified: false,
            },
            otp: {
                hash, 
                expiresAt, 
            }
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Email does not exist' });
        }

        const user = rows[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (isPasswordMatch) {
            const payload = {
                id: user.id,
                email: user.email,
                user_type: user.user_type,
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

            return res.status(200).json({ message: 'Login successful', token });
        } else {
            return res.status(400).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};




export const verifyOtpHandler = async (req: Request, res: Response) => {
    const { email, otp, hash, expiresAt } = req.body;

    if (!email || !otp || !hash || !expiresAt) {
        return res.status(400).json({ message: 'Email, OTP, hash, and expiration time are required' });
    }

    try {
        const calculatedHash = generateOtpHash(otp);

        if (calculatedHash !== hash) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (Date.now() > expiresAt) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const [result] = await db.query(
            'Update table users set is_verified = true where email = ?',
            [email]
        );

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};