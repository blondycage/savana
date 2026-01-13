import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import { authenticate } from '@/middleware/auth';

/**
 * Get dashboard statistics
 * GET /api/bookings/stats
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

    const totalBookings = await Booking.countDocuments();

    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPayments' },
          totalOutstanding: { $sum: '$remaining' }
        }
      }
    ]);

    return NextResponse.json({
      totalBookings,
      totalRevenue: stats[0]?.totalRevenue || 0,
      totalOutstanding: stats[0]?.totalOutstanding || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
