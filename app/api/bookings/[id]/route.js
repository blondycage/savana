import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import ImportBatch from '@/models/ImportBatch';
import { authenticate } from '@/middleware/auth';

/**
 * Get single booking by ID
 * GET /api/bookings/:id
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

    const { id } = await params;
    const booking = await Booking.findById(id).populate('importBatch');

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

/**
 * Update booking
 * PUT /api/bookings/:id
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
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Handle group name change
    if (body.groupName && (!booking.importBatch || booking.importBatch.name !== body.groupName)) {
      let batch = await ImportBatch.findOne({ name: body.groupName });
      if (!batch) {
        batch = new ImportBatch({
          name: body.groupName,
          fileName: 'Manual Entry',
          uploadedBy: authResult.user._id,
          uploadedAt: new Date(),
          totalRecords: 1,
          successCount: 1,
          errorCount: 0
        });
        await batch.save();
      }
      booking.importBatch = batch._id;
    }

    // Update all fields
    Object.keys(body).forEach(key => {
      if (key !== 'groupName' && body[key] !== undefined) {
        booking[key] = body[key];
      }
    });

    await booking.save();
    await booking.populate('importBatch');

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { message: 'Failed to update booking: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete booking
 * DELETE /api/bookings/:id
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
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { message: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
