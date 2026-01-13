import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { authenticate } from '@/middleware/auth';

/**
 * Update payment
 * PUT /api/payments/update/:id
 */
export async function PUT(request, { params }) {
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

    const { id } = await params;
    const { amount, paymentDate, paymentMethod, reference, notes } = await request.json();

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }

    const booking = await Booking.findById(payment.booking);

    // If amount is being changed, recalculate booking totals
    if (amount !== undefined && amount !== payment.amount) {
      const newAmount = parseFloat(amount);

      if (isNaN(newAmount) || newAmount <= 0) {
        return NextResponse.json(
          { message: 'Amount must be a valid number greater than 0' },
          { status: 400 }
        );
      }

      const oldAmount = parseFloat(payment.amount) || 0;
      const bookingPrice = parseFloat(booking.price) || 0;
      const bookingDeposit = parseFloat(booking.deposit) || 0;
      const bookingTotalPayments = parseFloat(booking.totalPayments) || 0;

      const difference = newAmount - oldAmount;
      const newTotal = bookingTotalPayments + difference;
      const maxAllowed = bookingPrice - bookingDeposit;

      if (newTotal > maxAllowed) {
        return NextResponse.json(
          { message: 'New amount would exceed remaining balance' },
          { status: 400 }
        );
      }

      booking.totalPayments = newTotal;
      await booking.save();

      payment.amount = newAmount;
    }

    // Update other fields
    if (paymentDate) payment.paymentDate = paymentDate;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (reference !== undefined) payment.reference = reference;
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    // Refresh booking from database to get updated calculated values
    const updatedBooking = await Booking.findById(payment.booking).populate('client');

    return NextResponse.json({ payment, booking: updatedBooking });
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { message: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
