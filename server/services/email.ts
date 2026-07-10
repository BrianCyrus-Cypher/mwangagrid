import nodemailer from 'nodemailer';
import { ENV } from '../_core/env';

const transporter = nodemailer.createTransport({
  host: ENV.smtp.host,
  port: ENV.smtp.port,
  secure: ENV.smtp.port === 465,
  auth: {
    user: ENV.smtp.user,
    pass: ENV.smtp.pass,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (ENV.isProduction) {
      await transporter.sendMail({
        from: ENV.smtp.from,
        to,
        subject,
        html,
      });
    } else {
      console.log('-------------------------------------------------------');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${html}`);
      console.log('-------------------------------------------------------');
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `https://www.mwangagrid.co.ke/verify-email?token=${token}`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
      <div style="background:#E07856;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">Mwanga Grid</h1>
      </div>
      <div style="padding:30px;background:#f9f9f9;">
        <h2>Welcome to Mwanga Grid, ${name}!</h2>
        <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 30px;background:#E07856;color:white;text-decoration:none;border-radius:5px;font-size:16px;">Verify Email</a>
        </div>
        <p>This link will expire in 24 hours.</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
        <p style="color:#888;font-size:12px;">Mwanga Grid — Powering Your Digital Future</p>
      </div>
    </div>
  `;
  await sendEmail(email, 'Verify your email for Mwanga Grid', html);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `https://www.mwangagrid.co.ke/reset-password?token=${token}`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
      <div style="background:#E07856;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">Mwanga Grid</h1>
      </div>
      <div style="padding:30px;background:#f9f9f9;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 30px;background:#E07856;color:white;text-decoration:none;border-radius:5px;font-size:16px;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
        <p style="color:#888;font-size:12px;">Mwanga Grid — Roasters next to Naivasha Mountain Mall, Nairobi</p>
      </div>
    </div>
  `;
  await sendEmail(email, 'Password Reset Request — Mwanga Grid', html);
}
