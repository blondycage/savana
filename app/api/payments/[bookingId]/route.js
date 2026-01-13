import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { authenticate } from '@/middleware/auth';

/**
 * Get all payments for a booking
 * GET /api/payments/:bookingId
 */
export async function GET(request, { params }) {
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

    const { bookingId } = await params;
    const payments = await Payment.find({ booking: bookingId })
      .populate('booking')
      .sort({ paymentDate: -1 });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

/**
 * Create new payment for a booking
 * POST /api/payments/:bookingId
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

    const { bookingId } = await params;
    const { amount, paymentDate, paymentMethod, reference, notes } = await request.json();

    // Validate required fields
    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { message: 'Amount and payment method are required' },
        { status: 400 }
      );
    }

    // Convert amount to number to prevent string concatenation
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { message: 'Amount must be a valid number greater than 0' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Ensure all booking values are numbers
    const bookingPackagePrice = parseFloat(booking.packagePrice) || 0;
    const bookingDeposit = parseFloat(booking.deposit) || 0;
    const bookingTotalPayments = parseFloat(booking.totalPayments) || 0;

    // Calculate current remaining balance (packagePrice - deposit - totalPayments)
    const currentRemaining = bookingPackagePrice - bookingDeposit - bookingTotalPayments;

    // Check if there's remaining balance to pay
    if (currentRemaining <= 0) {
      return NextResponse.json({
        message: 'This booking is already fully paid. No additional payments can be added.'
      }, { status: 400 });
    }

    // Check if payment would exceed remaining balance
    if (paymentAmount > currentRemaining) {
      return NextResponse.json({
        message: `Payment amount exceeds remaining balance. Remaining: $${currentRemaining.toLocaleString()}`
      }, { status: 400 });
    }

    // Create payment
    const payment = new Payment({
      booking: bookingId,
      amount: paymentAmount,
      paymentDate: paymentDate || Date.now(),
      paymentMethod,
      reference,
      notes
    });

    await payment.save();

    // Update booking's totalPayments (remaining balance will be calculated by pre-save hook)
    booking.totalPayments = bookingTotalPayments + paymentAmount;
    await booking.save();

    // Refresh booking from database to get updated calculated values
    const updatedBooking = await Booking.findById(bookingId);

    return NextResponse.json({ payment, booking: updatedBooking }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { message: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
