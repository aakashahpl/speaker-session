import {  Request, Response } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth';
import pool from '../utils/db';


export const newProfile = async(req:Request,res:Response) => {
    const { expertise, price_per_session } = req.body;
    const user = req.user as { id: string; email: string; user_type: string }; 
    const userId = user.id;
    if (!expertise || typeof expertise !== 'string') {
        return res.status(400).json({ message: 'Expertise is required and must be a string.' });
    }
    if (!price_per_session || typeof price_per_session !== 'number' || price_per_session <= 0) {
        return res.status(400).json({ message: 'Price per session must be a positive number.' });
    }

    try {
        const [existingProfile] = await pool.query(
            'SELECT * FROM speakers WHERE user_id = ?',
            [userId]
        );

        if ((existingProfile as any[]).length > 0) {
            return res.status(400).json({ message: 'Speaker profile already exists.' });
        }

        await pool.query(
            'INSERT INTO speakers (user_id, expertise, price_per_session) VALUES (?, ?, ?)',
            [userId, expertise, price_per_session]
        );

        res.status(201).json({ message: 'Speaker profile created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}


export const getAllSpeakers = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM speakers');

        res.status(200).json({
            message: 'Speakers fetched successfully.',
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching speakers:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};