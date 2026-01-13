import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { authenticate } from '@/middleware/auth';

/**
 * Delete payment
 * DELETE /api/payments/delete/:id
 */
export async function DELETE(request, { params }) {
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
    const payment = await Payment.findById(id);

    if (!payment) {
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update booking's totalPayments before deleting (remaining balance will be calculated by pre-save hook)
    const booking = await Booking.findById(payment.booking);
    const paymentAmount = parseFloat(payment.amount) || 0;
    const bookingTotalPayments = parseFloat(booking.totalPayments) || 0;

    booking.totalPayments = bookingTotalPayments - paymentAmount;
    await booking.save();

    await Payment.findByIdAndDelete(id);

    // Refresh booking from database to get updated calculated values
    const updatedBooking = await Booking.findById(payment.booking).populate('client');

    return NextResponse.json({ message: 'Payment deleted successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Delete payment error:', error);
    return NextResponse.json(
      { message: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
