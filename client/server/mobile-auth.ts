'use server';

import { prisma } from './prisma';
import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sendCustomEmail } from './utils/mail.utils';
import { DeliveryOptions, PaymentOptions } from '@prisma/client';
import { formatCurrency } from '@/lib/utils';
import * as referralCodes from 'referral-codes';
import moment from 'moment';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
);
const COOKIE_NAME = 'mobile-session';

// ─── Helpers ────────────────────────────────────────────

async function createToken(payload: Record<string, unknown>, expiresIn = '24h') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ─── Session ────────────────────────────────────────────

export async function getMobileSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  const user = await prisma.users.findUnique({
    where: { id: payload.sub as string },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      role: true,
      UserInformation: true,
    },
  });

  return user;
}

export async function mobileLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

// ─── Register ───────────────────────────────────────────

export async function mobileRegister(email: string, password: string) {
  try {
    // Validate
    if (!email || !password) {
      return { error: 'Email and password are required.' };
    }
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' };
    }

    // Check if exists
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return { error: 'User already exists.' };
    }

    // Create user
    const hashed = await hash(password, 12);
    const user = await prisma.users.create({
      data: { email, password: hashed },
    });

    return { success: true, id: user.id };
  } catch (err) {
    console.error('[mobileRegister]', err);
    return { error: 'Something went wrong. Please try again.' };
  }
}

// ─── Login ──────────────────────────────────────────────

export async function mobileLogin(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: 'Email and password are required.' };
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return { error: 'User not found.' };
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return { error: 'Invalid credentials.' };
    }

    // Create session token
    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return {
      success: true,
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      hasUserInfo: !!user.role, // we'll check UserInformation separately
    };
  } catch (err) {
    console.error('[mobileLogin]', err);
    return { error: 'Something went wrong. Please try again.' };
  }
}

// ─── Verify Email (Send OTP) ────────────────────────────

export async function mobileSendOtp(email: string) {
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return { error: 'User not found.' };
    if (user.emailVerified) return { error: 'Email already verified.' };

    const otp = generateOtp();
    const hashedOtp = await hash(otp, 12);

    // Store OTP in a JWT token
    const otpToken = await createToken(
      { otp: hashedOtp, email: user.email, sub: user.id },
      '10m'
    );

    // Send email
    await sendCustomEmail(
      email,
      'OTP Verification - DiReCT',
      `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f3f4f6; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #3b82f6; text-align: center; font-size: 24px; font-weight: 600;">OTP Verification</h2>
          <p style="font-size: 16px; color: #374151; margin-top: 16px;">Dear User,</p>
          <p style="font-size: 16px; color: #374151;">Please use the following OTP code to verify your email:</p>
          <div style="font-size: 32px; font-weight: bold; color: #1f2937; text-align: center; margin: 20px 0; padding: 10px; border: 1px dashed #3b82f6; border-radius: 8px; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #6b7280;">This code expires in 10 minutes.</p>
        </div>
      </div>
      `
    );

    return { success: true, otpToken };
  } catch (err) {
    console.error('[mobileSendOtp]', err);
    return { error: 'Failed to send OTP. Please try again.' };
  }
}

// ─── Verify OTP ─────────────────────────────────────────

export async function mobileVerifyOtp(otpToken: string, otp: string) {
  try {
    const payload = await verifyToken(otpToken);
    if (!payload?.sub || !payload?.otp) {
      return { error: 'Invalid or expired token.' };
    }

    const user = await prisma.users.findUnique({
      where: { id: payload.sub as string },
    });
    if (!user) return { error: 'User not found.' };
    if (user.emailVerified) return { error: 'Email already verified.' };

    const valid = await compare(otp, payload.otp as string);
    if (!valid) return { error: 'Invalid OTP code.' };

    await prisma.users.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return { success: true };
  } catch (err) {
    console.error('[mobileVerifyOtp]', err);
    return { error: 'Verification failed. Please try again.' };
  }
}

// ─── Forgot Password (Send OTP) ─────────────────────────

export async function mobileForgotPassword(email: string) {
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return { error: 'No account found with this email.' };

    const otp = generateOtp();
    const hashedOtp = await hash(otp, 12);

    const otpToken = await createToken(
      { otp: hashedOtp, email: user.email, sub: user.id, purpose: 'reset' },
      '10m'
    );

    await sendCustomEmail(
      email,
      'Password Reset - DiReCT',
      `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f3f4f6; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #3b82f6; text-align: center; font-size: 24px; font-weight: 600;">Password Reset</h2>
          <p style="font-size: 16px; color: #374151; margin-top: 16px;">Dear User,</p>
          <p style="font-size: 16px; color: #374151;">You requested to reset your password. Use the following OTP code:</p>
          <div style="font-size: 32px; font-weight: bold; color: #1f2937; text-align: center; margin: 20px 0; padding: 10px; border: 1px dashed #3b82f6; border-radius: 8px; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #6b7280;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      </div>
      `
    );

    return { success: true, otpToken };
  } catch (err) {
    console.error('[mobileForgotPassword]', err);
    return { error: 'Failed to send reset code. Please try again.' };
  }
}

// ─── Verify Reset OTP ───────────────────────────────────

export async function mobileVerifyResetOtp(otpToken: string, otp: string) {
  try {
    const payload = await verifyToken(otpToken);
    if (!payload?.sub || !payload?.otp || payload?.purpose !== 'reset') {
      return { error: 'Invalid or expired token.' };
    }

    const valid = await compare(otp, payload.otp as string);
    if (!valid) return { error: 'Invalid OTP code.' };

    // Generate a short-lived reset token
    const resetToken = await createToken(
      { sub: payload.sub, email: payload.email, purpose: 'reset-confirm' },
      '5m'
    );

    return { success: true, resetToken };
  } catch (err) {
    console.error('[mobileVerifyResetOtp]', err);
    return { error: 'Verification failed. Please try again.' };
  }
}

// ─── Reset Password ─────────────────────────────────────

export async function mobileResetPassword(resetToken: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const payload = await verifyToken(resetToken);
    if (!payload?.sub || payload?.purpose !== 'reset-confirm') {
      return { error: 'Invalid or expired reset link. Please start over.' };
    }

    const user = await prisma.users.findUnique({
      where: { id: payload.sub as string },
    });
    if (!user) return { error: 'User not found.' };

    const hashedPassword = await hash(newPassword, 12);
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (err) {
    console.error('[mobileResetPassword]', err);
    return { error: 'Password reset failed. Please try again.' };
  }
}

// ─── Save User Information ──────────────────────────────

export async function mobileSaveUserInfo(data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  studentNo: string;
  specialOrder?: string;
  address: string;
  phoneNo: string;
  birthDate?: string;
}) {
  try {
    const session = await getMobileSession();
    if (!session) return { error: 'Not authenticated.' };

    // Check if already exists
    const existing = await prisma.userInformation.findUnique({
      where: { userId: session.id },
    });
    if (existing) return { error: 'User information already exists.' };

    const { birthDate, ...rest } = data;

    await prisma.userInformation.create({
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate) : null,
        userId: session.id,
      },
    });

    return { success: true };
  } catch (err) {
    console.error('[mobileSaveUserInfo]', err);
    return { error: 'Failed to save information. Please try again.' };
  }
}

// ─── Get Student Statistics ─────────────────────────────

export async function mobileGetStatistics() {
  try {
    const session = await getMobileSession();
    if (!session) return null;

    const [completed, processing, cancelled, pending] = await Promise.all([
      prisma.requestDocuments.count({
        where: { usersId: session.id, status: 'COMPLETED' },
      }),
      prisma.requestDocuments.count({
        where: { usersId: session.id, status: 'PROCESSING' },
      }),
      prisma.requestDocuments.count({
        where: { usersId: session.id, status: 'CANCELLED' },
      }),
      prisma.requestDocuments.count({
        where: { usersId: session.id, status: 'PENDING' },
      }),
    ]);

    return { completed, processing, cancelled, pending };
  } catch (err) {
    console.error('[mobileGetStatistics]', err);
    return null;
  }
}

// ─── Get Student Transactions ───────────────────────────

export async function mobileGetTransactions() {
  try {
    const session = await getMobileSession();
    if (!session) return [];

    const results = await prisma.requestDocuments.findMany({
      where: { usersId: session.id },
      orderBy: { createdAt: 'desc' },
      include: {
        documentPayment: true,
        DocumentSelected: {
          include: { document: true },
        },
      },
    });

    // Convert Decimal fields to numbers for serialization
    return results.map((tx) => ({
      ...tx,
      documentPayment: {
        ...tx.documentPayment,
        documentFees: tx.documentPayment.documentFees ? Number(tx.documentPayment.documentFees) : null,
        shippingFees: tx.documentPayment.shippingFees ? Number(tx.documentPayment.shippingFees) : null,
        totalAmount: tx.documentPayment.totalAmount ? Number(tx.documentPayment.totalAmount) : null,
      },
      DocumentSelected: tx.DocumentSelected.map((ds) => ({
        ...ds,
        document: {
          ...ds.document,
          price: Number(ds.document.price),
        },
      })),
    }));
  } catch (err) {
    console.error('[mobileGetTransactions]', err);
    return [];
  }
}

// ─── Get Single Transaction ─────────────────────────────

export async function mobileGetTransaction(id: string) {
  try {
    const session = await getMobileSession();
    if (!session) return null;

    const tx = await prisma.requestDocuments.findFirst({
      where: { id, usersId: session.id },
      include: {
        documentPayment: true,
        DocumentSelected: {
          include: { document: true },
        },
      },
    });

    if (!tx) return null;

    // Convert Decimal fields to numbers for serialization
    return {
      ...tx,
      documentPayment: {
        ...tx.documentPayment,
        documentFees: tx.documentPayment.documentFees ? Number(tx.documentPayment.documentFees) : null,
        shippingFees: tx.documentPayment.shippingFees ? Number(tx.documentPayment.shippingFees) : null,
        totalAmount: tx.documentPayment.totalAmount ? Number(tx.documentPayment.totalAmount) : null,
      },
      DocumentSelected: tx.DocumentSelected.map((ds) => ({
        ...ds,
        document: {
          ...ds.document,
          price: Number(ds.document.price),
        },
      })),
    };
  } catch (err) {
    console.error('[mobileGetTransaction]', err);
    return null;
  }
}

// ─── Get Profile ────────────────────────────────────────

export async function mobileGetProfile() {
  try {
    const session = await getMobileSession();
    if (!session) return null;

    return await prisma.users.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        UserInformation: true,
      },
    });
  } catch (err) {
    console.error('[mobileGetProfile]', err);
    return null;
  }
}

// ─── Get Available Documents (filtered by eligibility) ──

export async function mobileGetDocuments() {
  try {
    const session = await getMobileSession();
    if (!session) return [];

    // Check user's specialOrder status to determine eligibility
    const userInfo = session.UserInformation;
    const eligibility = userInfo?.specialOrder ? 'GRADUATED' : 'STUDENT';

    const docs = await prisma.documents.findMany({
      where: {
        isAvailable: true,
        OR: [
          { eligibility },
          { eligibility: 'BOTH' },
        ],
      },
    });

    // Convert Decimal fields to numbers for serialization
    return docs.map((doc) => ({
      ...doc,
      price: Number(doc.price),
    }));
  } catch (err) {
    console.error('[mobileGetDocuments]', err);
    return [];
  }
}

// ─── Get Delivery Options (from admin settings) ────────

export async function mobileGetDeliveryOptions() {
  try {
    const options = await prisma.shippingOptionSetting.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    // If no settings exist in DB, return defaults
    if (options.length === 0) return ['PICKUP', 'LALAMOVE'];
    return options.map((o) => o.name);
  } catch (err) {
    console.error('[mobileGetDeliveryOptions]', err);
    return ['PICKUP', 'LALAMOVE'];
  }
}

// ─── Get Payment Options (from admin settings) ─────────

export async function mobileGetPaymentOptions() {
  try {
    const options = await prisma.paymentOptionSetting.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    // If no settings exist in DB, return defaults
    if (options.length === 0) return ['WALKIN'];
    return options.map((o) => o.name);
  } catch (err) {
    console.error('[mobileGetPaymentOptions]', err);
    return ['WALKIN'];
  }
}

// ─── Get Schedule Config ────────────────────────────────

export async function mobileGetScheduleConfig() {
  try {
    let config = await prisma.scheduleConfig.findFirst();
    if (!config) {
      config = await prisma.scheduleConfig.create({
        data: { maxSlotsPerDay: 300, minDaysAdvance: 3 },
      });
    }
    return {
      maxSlotsPerDay: config.maxSlotsPerDay,
      minDaysAdvance: config.minDaysAdvance,
    };
  } catch (err) {
    console.error('[mobileGetScheduleConfig]', err);
    return { maxSlotsPerDay: 300, minDaysAdvance: 3 };
  }
}

// ─── Get Holidays ───────────────────────────────────────

export async function mobileGetHolidays() {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    });
    return holidays.map((h) => ({
      date: h.date.toISOString().split('T')[0],
      name: h.name,
    }));
  } catch (err) {
    console.error('[mobileGetHolidays]', err);
    return [];
  }
}

// ─── Check Schedule Availability ────────────────────────

export async function mobileCheckSchedule(date: string) {
  try {
    const config = await mobileGetScheduleConfig();
    const parsedDate = new Date(date);

    const result = await prisma.requestDocuments.groupBy({
      by: ['selectedSchedule'],
      where: {
        selectedSchedule: { equals: parsedDate },
        OR: [
          { status: 'PENDING' },
          { status: 'PAID' },
          { status: 'PROCESSING' },
          { status: 'READYTOPICKUP' },
        ],
      },
      _count: { selectedSchedule: true },
    });

    if (result.length === 0) {
      return { count: 0, disabled: false };
    }

    const count = result[0]._count.selectedSchedule;
    return { count, disabled: count >= config.maxSlotsPerDay };
  } catch (err) {
    console.error('[mobileCheckSchedule]', err);
    return { count: 0, disabled: false };
  }
}

// ─── Submit Document Request (full validation + email) ──

export async function mobileSubmitRequest(data: {
  documentIds: string[];
  deliveryOption: string;
  paymentOption: string;
  schedule?: string;
  address?: string;
  additionalAddress?: string;
  longitude?: string;
  latitude?: string;
}) {
  let createdPaymentId: string | null = null;
  let createdRequestId: string | null = null;

  try {
    const session = await getMobileSession();
    if (!session) return { error: 'Not authenticated.' };

    // ── Validate payment option ──
    if (
      !data.paymentOption ||
      !Object.values(PaymentOptions).includes(data.paymentOption as PaymentOptions)
    ) {
      return { error: 'Invalid payment option.' };
    }

    // ── Validate delivery option ──
    if (
      !data.deliveryOption ||
      !Object.values(DeliveryOptions).includes(data.deliveryOption as DeliveryOptions)
    ) {
      return { error: 'Please select a delivery option.' };
    }

    // ── Validate schedule ──
    if (data.schedule) {
      const scheduleDate = moment(data.schedule).format('YYYY-MM-DD');
      const scheduleCheck = await mobileCheckSchedule(scheduleDate);
      if (scheduleCheck.disabled) {
        return { error: 'Selected schedule date is already full.' };
      }

      const selectedDocs = await prisma.documents.findMany({
        where: { id: { in: data.documentIds } },
        select: { dayBeforeRelease: true },
      });
      const maxMinDays = selectedDocs.length > 0
        ? Math.max(...selectedDocs.map((d) => d.dayBeforeRelease))
        : 3;

      let daysToAdd = maxMinDays;
      const minDate = new Date();
      minDate.setHours(0, 0, 0, 0);
      while (daysToAdd > 0) {
        minDate.setDate(minDate.getDate() + 1);
        if (minDate.getDay() !== 0) daysToAdd--;
      }
      if (moment(data.schedule).isBefore(moment(minDate).startOf('day'))) {
        return {
          error: `Schedule must be at least ${maxMinDays} business days in advance.`,
        };
      }

      const holidays = await mobileGetHolidays();
      if (holidays.some((h) => h.date === scheduleDate)) {
        return { error: 'Selected date is a holiday.' };
      }

      if (moment(data.schedule).day() === 0) {
        return { error: 'Schedule cannot be on a Sunday.' };
      }
    }

    // ── Validate address for LALAMOVE ──
    if (data.deliveryOption === 'LALAMOVE') {
      if (!data.address) {
        return { error: 'Address is required for delivery.' };
      }
      if (!data.additionalAddress) {
        return { error: 'Additional address is required for delivery.' };
      }
    }

    // ── Validate documents exist ──
    const documents = await prisma.documents.findMany({
      where: { id: { in: data.documentIds } },
      select: { id: true, name: true, price: true },
    });
    if (documents.length === 0) {
      return { error: 'No valid documents selected.' };
    }

    // ── Calculate total ──
    const totalDocumentAmount = documents.reduce(
      (sum, doc) => sum + Number(doc.price),
      0
    );

    // ── Generate reference number ──
    const refNum = referralCodes.generate({
      prefix: 'DiReCT-',
      postfix: `${Math.floor(Math.random() * 10000)}`,
    });
    const referenceNumber = refNum[0];

    // ── Xendit payment integration (optional) ──
    let xenditInvoiceId: string | null = null;
    const XENDIT_ENABLED =
      !!process.env.XENDIT_SECRET_KEY && process.env.XENDIT_SECRET_KEY !== '';

    if (XENDIT_ENABLED) {
      try {
        const { Xendit } = require('xendit-node');
        const xenditClient = new Xendit({
          secretKey: process.env.XENDIT_SECRET_KEY as string,
        });
        const createPayment = await xenditClient.Invoice.createInvoice({
          data: {
            amount: totalDocumentAmount,
            currency: 'PHP',
            externalId: referenceNumber,
            paymentMethods: [data.paymentOption],
            successRedirectUrl: 'https://pos.kumatechnologies.com/thank-you',
          },
        });
        xenditInvoiceId = createPayment.id ?? null;
      } catch (e) {
        console.warn(
          '[Xendit] Payment creation failed, proceeding without invoice:',
          e
        );
      }
    }

    // ── Create payment record ──
    const payment = await prisma.documentPayment.create({
      data: {
        referenceNumber: referenceNumber || 'DiReCT-0001',
        paymentOptions: data.paymentOption as PaymentOptions,
        totalAmount: totalDocumentAmount,
        xenditInvoiceId,
      },
    });
    createdPaymentId = payment.id;

    // ── Validate schedule format ──
    if (data.schedule && isNaN(Date.parse(data.schedule))) {
      // Rollback payment
      await prisma.documentPayment.delete({ where: { id: payment.id } });
      createdPaymentId = null;
      return { error: 'Invalid schedule date.' };
    }

    // ── Create request ──
    const request = await prisma.requestDocuments.create({
      data: {
        selectedSchedule: data.schedule ? new Date(data.schedule) : null,
        deliverOptions: data.deliveryOption as DeliveryOptions,
        documentPaymentId: payment.id,
        usersId: session.id,
        status: 'PENDING',
        address: data.address || null,
        additionalAddress: data.additionalAddress || null,
        longitude: data.longitude || null,
        latitude: data.latitude || null,
      },
    });
    createdRequestId = request.id;

    // ── Create document selections ──
    const createdDocumentSelected = await prisma.documentSelected.createMany({
      data: data.documentIds.map((docId) => ({
        documentId: docId,
        userId: session.id,
        requestDocumentsId: request.id,
      })),
    });

    if (!createdDocumentSelected) {
      // Rollback
      await prisma.requestDocuments.delete({ where: { id: request.id } });
      await prisma.documentPayment.delete({ where: { id: payment.id } });
      createdRequestId = null;
      createdPaymentId = null;
      return { error: 'Failed to create document selections.' };
    }

    // ── Send confirmation email ──
    try {
      const userInfo = session.UserInformation;
      const firstName = userInfo?.firstName || 'Student';

      const emailContent = `
      <div style="font-family: 'Poppins', sans-serif; padding: 32px; background-color: #f8fafc; border-radius: 12px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 24px; color: #1f2937; text-align: center;">Order Confirmation</h2>
        <p style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 24px;">Dear ${firstName},</p>
        <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Your order has been confirmed. Your reference number is 
          <strong style="font-weight: 600; color: #111827;">${referenceNumber}</strong>.
        </p>
        <h3 style="margin-top: 32px; font-size: 20px; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03); margin-bottom: 24px;">
          <thead>
            <tr>
              <th style="border-bottom: 2px solid #e5e7eb; padding: 12px; text-align: left; background-color: #f3f4f6; color: #1f2937; font-size: 16px;">Document Name</th>
              <th style="border-bottom: 2px solid #e5e7eb; padding: 12px; text-align: right; background-color: #f3f4f6; color: #1f2937; font-size: 16px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${documents
              .map(
                (doc) => `
                <tr style="background-color: #ffffff;">
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 12px; color: #374151; font-size: 15px;">${doc.name}</td>
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 12px; color: #374151; text-align: right; font-size: 15px;">${formatCurrency(Number(doc.price ?? 0))}</td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; text-align: right;">Total Price: 
          ${
            data.deliveryOption !== 'PICKUP'
              ? formatCurrency(totalDocumentAmount) + ' + Delivery Fees'
              : formatCurrency(totalDocumentAmount)
          }
          </h3>
        </div>
        <h3 style="margin-top: 32px; font-size: 20px; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Payment Instructions</h3>
        <p style="margin-top: 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">Please follow the instructions below to complete your payment:</p>
        <ol style="list-style-type: decimal; margin-top: 12px; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 32px;">
          <li style="margin-bottom: 12px;">Log in to your online banking account or visit your nearest bank branch.</li>
          <li style="margin-bottom: 12px;">Use the following payment options to complete your transaction:</li>
          <ul style="list-style-type: disc; margin-top: 8px; padding-left: 40px; color: #4b5563; font-size: 16px; line-height: 1.8;">
            <li style="margin-bottom: 8px;">Use the reference number as the transaction reference.</li>
          </ul>
          <li style="margin-top: 12px;">Once the payment is completed, keep the transaction receipt for your records.</li>
        </ol>
      </div>
      `;

      await sendCustomEmail(
        session.email,
        'DiReCT - Order Confirmation',
        emailContent
      );
    } catch (emailErr) {
      console.warn('[mobileSubmitRequest] Email sending failed:', emailErr);
      // Don't fail the order if email fails
    }

    return { success: true, id: request.id, referenceNumber };
  } catch (err) {
    console.error('[mobileSubmitRequest]', err);

    // Rollback on unexpected errors
    try {
      if (createdRequestId) {
        await prisma.documentSelected.deleteMany({
          where: { requestDocumentsId: createdRequestId },
        });
        await prisma.requestDocuments.delete({
          where: { id: createdRequestId },
        });
      }
      if (createdPaymentId) {
        await prisma.documentPayment.delete({
          where: { id: createdPaymentId },
        });
      }
    } catch (rollbackErr) {
      console.error('[mobileSubmitRequest] Rollback failed:', rollbackErr);
    }

    return { error: 'Failed to submit request. Please try again.' };
  }
}

// ─── Cancel Order ───────────────────────────────────────

export async function mobileCancelOrder(id: string) {
  try {
    const session = await getMobileSession();
    if (!session) return { error: 'Not authenticated.' };

    const request = await prisma.requestDocuments.findFirst({
      where: { id, usersId: session.id, status: 'PENDING' },
    });
    if (!request) return { error: 'Order not found or cannot be cancelled.' };

    await prisma.requestDocuments.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await prisma.documentPayment.update({
      where: { id: request.documentPaymentId },
      data: { status: 'CANCELLED' },
    });

    return { success: true };
  } catch (err) {
    console.error('[mobileCancelOrder]', err);
    return { error: 'Failed to cancel order. Please try again.' };
  }
}
