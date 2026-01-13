import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { authenticate } from '@/middleware/auth';

/**
 * Get payment reports/analytics
 * GET /api/payments/reports/summary
 */
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
    }

    // Total payments by method
    const paymentsByMethod = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly payments
    const monthlyPayments = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Total paid vs remaining
    const bookings = await Booking.find();
    const totalPaid = bookings.reduce((sum, b) => sum + b.totalPayments, 0);
    const totalRemaining = bookings.reduce((sum, b) => sum + b.remaining, 0);

    return NextResponse.json({
      paymentsByMethod,
      monthlyPayments,
      summary: {
        totalPaid,
        totalRemaining,
        totalBookingValue: totalPaid + totalRemaining
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch payment reports' },
      { status: 500 }
    );
  }
}
