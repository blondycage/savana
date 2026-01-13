import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateResetToken } from '@/middleware/auth';
import { sendPasswordResetEmail } from '@/utils/mailer';

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        message: 'If an account exists, a reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken(user._id);

    // Save token to database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      message: 'If an account exists, a reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
