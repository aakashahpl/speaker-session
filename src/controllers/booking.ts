import {  Request, Response } from 'express';
import pool from '../utils/db';
import { sendMail } from '../utils/mailservice';
import { createEvent } from '../utils/calendarService';


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

        const [speakerData] = await pool.query(
            `SELECT * FROM users 
             WHERE id = ?`,
            [speaker_id]
        );

        // console.log(speakerData);

        const speakerEmail = speakerData[0].email;
        const speakerName = speakerData[0].first_name;

        // send booking confirmation mail to user and speaker.

        const subject = "Booking Confirmed";
        const booking_time = (8+slot);
        const userHtml = `<div>Your booking with speaker ${speakerName} is confirmed on ${booking_date} from ${booking_time}:00 to ${booking_time+1}:00.</div>`
        const speakerHtml = `<div>Your have a booking on ${booking_date} from ${booking_time}:00 to ${booking_time+1}:00. <br> You can contact the client using the following email. <br>${user.email}</div>`
        // sendMail(user.email,subject,userHtml);
        // sendMail(speakerMail,subject,speakerHtml);

        const timeZoneOffset = "+05:30"; // Time zone offset

        // Calculate the hour based on the slot number
        const starthour = 8 + (slot);
    
        // Parse the date to a JavaScript Date object
        const parsedDate = new Date(booking_date);
        parsedDate.setHours(starthour, 0, 0, 0); // Set the calculated time
    
        // Format the date-time string
        const startDateTime = parsedDate.toISOString().replace("Z", timeZoneOffset);
        
        parsedDate.setHours(starthour+1, 0, 0, 0); // Set the calculated time
        const endDateTime = parsedDate.toISOString().replace("Z", timeZoneOffset);

        //send google calendar invites 
        const eventDetails = {
            location:"online",
            summary:"Tech talk",
            start:{
                dateTime:startDateTime
            },
            end:{
                dateTime:endDateTime
            },
            userEmail:user.email,
            speakerEmail:speakerEmail

        }
        createEvent(eventDetails);

        res.status(201).json({ message: 'Slot booked successfully.' });
    } catch (error) {
        console.error('Error booking slot:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

