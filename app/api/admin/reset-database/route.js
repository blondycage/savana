import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import ImportBatch from '@/models/ImportBatch';
import User from '@/models/User';
import { authenticate } from '@/middleware/auth';

/**
 * Reset database - Delete all bookings, payments, and import batches
 * POST /api/admin/reset-database
 *
 * Options:
 * - keepUsers: true/false (default: true)
 */
export async function POST(request) {
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

    const body = await request.json();
    const { keepUsers = true } = body;

    // Delete all payments
    const paymentsDeleted = await Payment.deleteMany({});
    console.log('🗑️ Deleted payments:', paymentsDeleted.deletedCount);

    // Delete all bookings
    const bookingsDeleted = await Booking.deleteMany({});
    console.log('🗑️ Deleted bookings:', bookingsDeleted.deletedCount);

    // Delete all import batches
    const batchesDeleted = await ImportBatch.deleteMany({});
    console.log('🗑️ Deleted import batches:', batchesDeleted.deletedCount);

    let usersDeleted = { deletedCount: 0 };
    if (!keepUsers) {
      // Delete all users
      usersDeleted = await User.deleteMany({});
      console.log('🗑️ Deleted users:', usersDeleted.deletedCount);
    }

    return NextResponse.json({
      message: 'Database reset successfully',
      deleted: {
        payments: paymentsDeleted.deletedCount,
        bookings: bookingsDeleted.deletedCount,
        importBatches: batchesDeleted.deletedCount,
        users: usersDeleted.deletedCount
      }
    });
  } catch (error) {
    console.error('Reset database error:', error);
    return NextResponse.json(
      { message: 'Failed to reset database: ' + error.message },
      { status: 500 }
    );
  }
}
