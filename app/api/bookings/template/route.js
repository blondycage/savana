import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { generateCompanyTemplate } from '@/utils/excel';

/**
 * Download Excel template for import
 * GET /api/bookings/template
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

    // Generate company template with sample data
    const buffer = generateCompanyTemplate();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=CUMRA_2025_Template.xlsx'
      }
    });
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json(
      { message: 'Failed to download template' },
      { status: 500 }
    );
  }
}
