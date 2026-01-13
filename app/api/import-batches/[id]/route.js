import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ImportBatch from '@/models/ImportBatch';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import { authenticate } from '@/middleware/auth';

/**
 * Delete import batch and all associated bookings
 * DELETE /api/import-batches/:id
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

    // Find the batch
    const batch = await ImportBatch.findById(id);
    if (!batch) {
      return NextResponse.json(
        { message: 'Import batch not found' },
        { status: 404 }
      );
    }

    // Find all bookings in this batch
    const bookings = await Booking.find({ importBatch: id });
    const bookingIds = bookings.map(b => b._id);

    // Delete all payments associated with these bookings
    const deletedPayments = await Payment.deleteMany({ booking: { $in: bookingIds } });

    // Delete all bookings in this batch
    const deletedBookings = await Booking.deleteMany({ importBatch: id });

    // Delete the import batch itself
    await ImportBatch.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Import batch deleted successfully',
      deletedBookings: deletedBookings.deletedCount,
      deletedPayments: deletedPayments.deletedCount
    });
  } catch (error) {
    console.error('Delete import batch error:', error);
    return NextResponse.json(
      { message: 'Failed to delete import batch: ' + error.message },
      { status: 500 }
    );
  }
}
