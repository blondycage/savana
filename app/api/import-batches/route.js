import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ImportBatch from '@/models/ImportBatch';
import Booking from '@/models/Booking';
import { authenticate } from '@/middleware/auth';

/**
 * Get all import batches with booking counts
 * GET /api/import-batches
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

    const batches = await ImportBatch.find()
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    // Get booking count for each batch
    const batchesWithCounts = await Promise.all(
      batches.map(async (batch) => {
        const bookingCount = await Booking.countDocuments({ importBatch: batch._id });
        return {
          ...batch.toObject(),
          bookingCount
        };
      })
    );

    return NextResponse.json(batchesWithCounts);
  } catch (error) {
    console.error('Get import batches error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch import batches' },
      { status: 500 }
    );
  }
}
