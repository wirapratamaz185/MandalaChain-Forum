import { nodemailer } from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

export const sendEmail = async (EMAIL_FROM: string | undefined, to: string, subject: string, text: string) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject,
        text,
    });
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
    await sendEmail(
        process.env.EMAIL_FROM,
        to,
        'Reset Your Password',
        `Please click the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`
    );
};