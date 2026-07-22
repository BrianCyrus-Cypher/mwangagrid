import nodemailer from "nodemailer";
import { ENV } from "../_core/env";

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
      console.log("-------------------------------------------------------");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${html}`);
      console.log("-------------------------------------------------------");
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
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
  await sendEmail(email, "Verify your email for Mwanga Grid", html);
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
  await sendEmail(email, "Password Reset Request — Mwanga Grid", html);
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  items: { name: string; qty: number; price: string }[],
  totalAmount: string,
  deliveryLocation: string
) {
  const itemsHtml = items
    .map(
      i =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;">${i.name}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">KES ${parseInt(i.price).toLocaleString()}</td></tr>`
    )
    .join("");
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
      <div style="background:#E07856;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:20px;">Mwanga Grid</h1>
      </div>
      <div style="padding:30px;background:#f9f9f9;">
        <h2 style="color:#333;">Thank you for your order, ${name}!</h2>
        <p style="color:#666;">Your order <strong>${orderNumber}</strong> has been received and is being reviewed.</p>

        <h3 style="color:#333;margin-top:24px;">Order Summary</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead><tr style="background:#eee;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Price</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot><tr><td colspan="2" style="padding:8px;text-align:right;font-weight:bold;">Total</td><td style="padding:8px;text-align:right;font-weight:bold;color:#E07856;">KES ${parseInt(totalAmount).toLocaleString()}</td></tr></tfoot>
        </table>

        <p style="color:#666;margin-top:20px;"><strong>Delivery:</strong> ${deliveryLocation}</p>

        <div style="background:#fff3e8;border-left:4px solid #E07856;padding:16px;margin:20px 0;border-radius:4px;">
          <p style="margin:0;color:#555;font-size:13px;">
            A Mwanga Grid technician will review your order and contact you within 24 hours to confirm transport, coverage and installation timing.
          </p>
        </div>

        <p style="color:#888;font-size:12px;">Mwanga Grid — Roasters next to Naivasha Mountain Mall, Nairobi</p>
      </div>
    </div>
  `;
  await sendEmail(
    email,
    `Order Confirmed — ${orderNumber} — Mwanga Grid`,
    html
  );
}

export async function sendOrderStatusEmail(
  email: string,
  name: string,
  orderNumber: string,
  newStatus: string
) {
  const statusMsg: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared.",
    "en-route": "Your order is en route and will be delivered soon.",
    shipped: "Your order has been dispatched and is on the way.",
    delivered:
      "Your order has been delivered. Thank you for choosing Mwanga Grid!",
    cancelled:
      "Unfortunately, your order has been cancelled. Contact us for more info.",
  };
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
      <div style="background:#E07856;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:20px;">Mwanga Grid</h1>
      </div>
      <div style="padding:30px;background:#f9f9f9;">
        <h2 style="color:#333;">Hi ${name},</h2>
        <p style="color:#666;">Order <strong>${orderNumber}</strong> has been updated to <strong>${newStatus.toUpperCase()}</strong>.</p>
        <p style="color:#666;">${statusMsg[newStatus] || "Your order status has been updated."}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
        <p style="color:#888;font-size:12px;">Mwanga Grid — Roasters next to Naivasha Mountain Mall, Nairobi</p>
      </div>
    </div>
  `;
  await sendEmail(
    email,
    `Order ${newStatus} — ${orderNumber} — Mwanga Grid`,
    html
  );
}
