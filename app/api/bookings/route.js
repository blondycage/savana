import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import ImportBatch from '@/models/ImportBatch';
import { authenticate } from '@/middleware/auth';

/**
 * Get all bookings with optional filtering and pagination
 * GET /api/bookings?search=term&status=Confirmed&startDate=...&endDate=...&importBatchId=...&page=1&limit=50&sortBy=remaining&hasRemaining=true&hasUmrahFee=true
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
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const importBatchId = searchParams.get('importBatchId');
    const hasRemaining = searchParams.get('hasRemaining');
    const hasUmrahFee = searchParams.get('hasUmrahFee');
    const sortBy = searchParams.get('sortBy') || 'travelDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by import batch
    if (importBatchId) {
      query.importBatch = importBatchId;
    }

    // Filter by date range (dates stored as strings)
    if (startDate || endDate) {
      query.travelDate = {};
      if (startDate) query.travelDate.$gte = startDate;
      if (endDate) query.travelDate.$lte = endDate;
    }

    // Filter by remaining payment
    if (hasRemaining === 'true') {
      query.remaining = { $gt: 0 };
    } else if (hasRemaining === 'false') {
      query.remaining = { $lte: 0 };
    }

    // Filter by umrah fee
    if (hasUmrahFee === 'true') {
      query.umraVisaFee = { $gt: 0 };
    } else if (hasUmrahFee === 'false') {
      query.umraVisaFee = { $lte: 0 };
    }

    // Search across all fields if search term provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { bookingNumber: searchRegex },
        { eTicket: searchRegex },
        { surname: searchRegex },
        { firstName: searchRegex },
        { passport: searchRegex },
        { nationality: searchRegex },
        { visa: searchRegex },
        { privateRoom: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { notes: searchRegex }
      ];
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const totalCount = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated results
    const bookings = await Booking.find(query)
      .populate('importBatch', 'name fileName uploadedAt')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

/**
 * Create new booking
 * POST /api/bookings
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

    // If groupName provided, create or find ImportBatch for manual entry
    let importBatchId = body.importBatch;

    if (body.groupName && !importBatchId) {
      // Find or create manual entry batch
      let batch = await ImportBatch.findOne({ name: body.groupName });

      if (!batch) {
        batch = new ImportBatch({
          name: body.groupName,
          fileName: 'Manual Entry',
          uploadedBy: authResult.user._id,
          uploadedAt: new Date(),
          totalRecords: 1,
          successCount: 0,
          errorCount: 0
        });
        await batch.save();
      }

      importBatchId = batch._id;
      batch.totalRecords++;
      batch.successCount++;
      await batch.save();
    }

    const booking = new Booking({
      importBatch: importBatchId,
      eTicket: body.eTicket || 'Not Assigned',
      bookingNumber: body.bookingNumber || 'Not Assigned',
      surname: body.surname || 'Not Assigned',
      firstName: body.firstName || 'Not Assigned',
      passport: body.passport || 'Not Assigned',
      travelDate: body.travelDate,
      returnDate: body.returnDate,
      visa: body.visa || 'Not Assigned',
      dateOfBirth: body.dateOfBirth,
      nationality: body.nationality || 'Not Assigned',
      packagePrice: body.packagePrice || 0,
      deposit: body.deposit || 0,
      remaining: body.remaining || 0,
      umraVisaFee: body.umraVisaFee || 0,
      privateRoom: body.privateRoom || 'Not Assigned',
      status: body.status || 'Pending',
      notes: body.notes || '',
      email: body.email || 'Not Assigned',
      phone: body.phone || 'Not Assigned'
    });

    await booking.save();
    await booking.populate('importBatch');

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { message: 'Failed to create booking: ' + error.message },
      { status: 500 }
    );
  }
}
