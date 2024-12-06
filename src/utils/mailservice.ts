import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

export const sendMail = async (to:string,subject:string,html:string) => {
    const transporter = nodemailer.createTransport({
        service: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: "",
        to: to,
        subject: subject,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
