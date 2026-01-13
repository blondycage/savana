import nodemailer from 'nodemailer';

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `Travel Agency <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send payment confirmation email
 * @param {string} email - Recipient email
 * @param {Object} client - Client details
 * @param {Object} booking - Booking details
 * @param {Object} payment - Payment details
 * @param {string} customSubject - Custom subject line
 * @param {string} customBody - Custom message body
 */
export const sendPaymentConfirmationEmail = async (email, client, booking, payment, customSubject, customBody) => {
  const mailOptions = {
    from: `Travel Agency <${process.env.SMTP_USER}>`,
    to: email,
    subject: customSubject || `Payment Confirmation - Booking #${booking.bookingNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 10px;">Payment Confirmation</h2>
          <p style="color: #666; margin: 0;">Thank you for your payment!</p>
        </div>
        
        <div style="background-color: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; width: 30%;">Booking Number:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${booking.bookingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">E-Ticket:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${booking.eTicket}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Travel Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${new Date(booking.travelDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Total Price:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">$${booking.price.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #2d5a2d; margin-bottom: 15px;">Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #c3e6c3; font-weight: bold; width: 30%;">Amount Paid:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #c3e6c3; color: #2d5a2d; font-weight: bold;">$${payment.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #c3e6c3; font-weight: bold;">Payment Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #c3e6c3;">${new Date(payment.paymentDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #c3e6c3; font-weight: bold;">Payment Method:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #c3e6c3;">${payment.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Reference:</td>
              <td style="padding: 8px 0;">${payment.reference || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin-bottom: 10px;">Remaining Balance</h3>
          <p style="color: #856404; margin: 0; font-size: 18px; font-weight: bold;">$${booking.remaining.toLocaleString()}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="color: #666; margin: 0; white-space: pre-line;">${customBody || 'Thank you for your business. If you have any questions, please don\'t hesitate to contact us.\n\nBest regards,\nTravel Agency Team'}</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw new Error('Failed to send payment confirmation email');
  }
};
