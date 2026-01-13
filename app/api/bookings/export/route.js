import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import { authenticate } from '@/middleware/auth';
import { generateExcel, mapBookingToExcelRow } from '@/utils/excel';

/**
 * Export bookings to Excel
 * GET /api/bookings/export
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

    const bookings = await Booking.find();

    // Map bookings to company Excel format
    const data = bookings.map(booking => mapBookingToExcelRow(booking.toObject()));

    const buffer = generateExcel(data, 'CUMRA 2025');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=CUMRA_2025_Bookings_Export.xlsx'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { message: 'Failed to export bookings' },
      { status: 500 }
    );
  }
}
