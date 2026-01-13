import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { authenticate } from '@/middleware/auth';
import { sendPaymentConfirmationEmail } from '@/utils/mailer';

/**
 * Send payment confirmation email
 * POST /api/payments/send-email/:paymentId
 */
export async function POST(request, { params }) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.message },
        { status: authResult.status }
      );
    }

    await connectDB();

    const { paymentId } = await params;
    const { recipientEmail, subject, body } = await request.json();

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Fetch booking
    const booking = await Booking.findById(payment.booking);
    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Use provided recipient email or fall back to booking email
    const emailTo = recipientEmail || booking.email;

    if (!emailTo || emailTo === 'Not Assigned') {
      return NextResponse.json(
        { message: 'Please provide a recipient email address.' },
        { status: 400 }
      );
    }

    // Send email with the booking data
    await sendPaymentConfirmationEmail(
      emailTo,
      {
        firstName: booking.firstName,
        surname: booking.surname,
        passport: booking.passport
      },
      booking,
      payment,
      subject,
      body
    );

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { message: 'Failed to send email: ' + error.message },
      { status: 500 }
    );
  }
}
