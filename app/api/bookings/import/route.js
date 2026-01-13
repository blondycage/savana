import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import ImportBatch from '@/models/ImportBatch';
import Payment from '@/models/Payment';
import { authenticate } from '@/middleware/auth';
import { parseExcel, mapExcelToBooking } from '@/utils/excel';

/**
 * Import bookings from Excel
 * POST /api/bookings/import
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
    console.log('📦 Request body type:', typeof body);
    console.log('📦 Request body keys:', Object.keys(body || {}));

    const { data, importName, fileName } = body; // Base64 encoded Excel data

    if (!data) {
      console.error('❌ No data in request body');
      return NextResponse.json(
        { message: 'No data provided' },
        { status: 400 }
      );
    }

    console.log('📦 Data type:', typeof data);
    console.log('📦 Data length:', typeof data === 'string' ? data.length : 'not a string');

    // Decode base64 to buffer
    const buffer = Buffer.from(data, 'base64');
    const rows = parseExcel(buffer);

    console.log('📊 Excel Import - Total rows:', rows.length);
    if (rows.length > 0) {
      console.log('📋 Sample row columns:', Object.keys(rows[0]));
      console.log('📝 Sample row data:', rows[0]);
    }

    // Create ImportBatch
    const batchName = importName || fileName || `Import ${new Date().toISOString()}`;
    const importBatch = new ImportBatch({
      name: batchName,
      fileName: fileName || 'Unknown',
      uploadedBy: authResult.user._id,
      uploadedAt: new Date(),
      totalRecords: rows.length,
      successCount: 0,
      errorCount: 0
    });

    await importBatch.save();
    console.log('✅ ImportBatch created:', importBatch._id, batchName);

    const imported = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const bookingData = mapExcelToBooking(rows[i]);

        console.log(`\n🔄 Processing row ${i + 1}:`, {
          bookingNumber: bookingData.bookingNumber,
          surname: bookingData.surname,
          firstName: bookingData.firstName
        });

        // Create booking with importBatch reference
        const booking = new Booking({
          ...bookingData,
          importBatch: importBatch._id
        });

        await booking.save();

        // Create initial payment if there's a deposit
        if (bookingData.deposit && bookingData.deposit > 0) {
          const payment = new Payment({
            booking: booking._id,
            amount: bookingData.deposit,
            paymentDate: new Date(),
            reference: `Initial deposit from Excel import`,
            notes: 'Auto-created from Excel import'
          });
          await payment.save();

          // Update booking totalPayments
          booking.totalPayments = bookingData.deposit;
          await booking.save();
        }

        imported.push(booking);
        importBatch.successCount++;
        console.log(`✅ Row ${i + 1} imported successfully`);
      } catch (error) {
        console.error(`❌ Row ${i + 1} error:`, error);
        errors.push({ row: i + 1, message: error.message || error.toString() });
        importBatch.errorCount++;
      }
    }

    // Update import batch final counts
    await importBatch.save();

    console.log(`\n📈 Import Summary: ${imported.length} bookings created, ${errors.length} errors`);

    return NextResponse.json({
      message: `Import complete! ${imported.length} bookings created, ${errors.length} errors`,
      importBatch: {
        _id: importBatch._id,
        name: importBatch.name,
        successCount: importBatch.successCount,
        errorCount: importBatch.errorCount,
        totalRecords: importBatch.totalRecords
      },
      bookingsCreated: imported.length,
      errors: errors.slice(0, 10) // Only send first 10 errors to avoid large payload
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { message: 'Failed to import bookings: ' + error.message },
      { status: 500 }
    );
  }
}
