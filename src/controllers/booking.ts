import {  Request, Response } from 'express';
import { verifyToken, verifyRole } from '../middleware/auth';
import pool from '../utils/db';


export const bookSlot = async (req: Request, res: Response) => {
    const { speaker_id, slot, booking_date } = req.body;
    const user = req.user as { id: number; email: string; user_type: string };
    const user_id = user.id;

    
    if (!speaker_id || !slot || !booking_date) {
        return res.status(400).json({ message: 'Speaker ID, slot, and booking date are required.' });
    }

    // total 7 slots (9am - 4pm)
    if(slot<1||slot>7){
        return res.status(400).json({message:"slot number should be between 1 to 9"});
    }
    try {

        // Check if the slot is already booked

        const [existingSlot] = await pool.query(
            `SELECT * FROM bookings 
             WHERE speaker_id = ? AND slot = ? AND booking_date = ?`,
            [speaker_id, slot, booking_date]
        );

        if ((existingSlot as any[]).length > 0) {
            return res.status(400).json({ message: 'This slot is already booked.' });
        }

        
        await pool.query(
            `INSERT INTO bookings (user_id, speaker_id, slot, booking_date) 
             VALUES (?, ?, ?, ?)`,
            [user_id, speaker_id, slot, booking_date]
        );

        res.status(201).json({ message: 'Slot booked successfully.' });
    } catch (error) {
        console.error('Error booking slot:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

