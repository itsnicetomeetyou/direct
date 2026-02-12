'use server';
import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

// ==================== PAYMENT OPTIONS ====================

export async function fetchPaymentOptions() {
  const options = await prisma.paymentOptionSetting.findMany({
    orderBy: { createdAt: 'asc' }
  });
  return options;
}

export async function togglePaymentOption(id: string, isActive: boolean) {
  const option = await prisma.paymentOptionSetting.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/dashboard/settings/payment-options');
  return option;
}

export async function seedPaymentOptions() {
  const defaults = [
    { name: 'GCASH', isActive: false },
    { name: 'PAYMAYA', isActive: false },
    { name: 'PAYPAL', isActive: false },
    { name: 'CREDITCARD', isActive: false },
    { name: 'WALKIN', isActive: true },
    { name: 'PORTAL_GENERATED', isActive: true },
    { name: 'ATTACHED_FILE', isActive: true }
  ];
  for (const opt of defaults) {
    await prisma.paymentOptionSetting.upsert({
      where: { name: opt.name },
      update: {},
      create: opt
    });
  }
  return fetchPaymentOptions();
}

// ==================== SHIPPING OPTIONS ====================

export async function fetchShippingOptions() {
  const options = await prisma.shippingOptionSetting.findMany({
    orderBy: { createdAt: 'asc' }
  });
  return options;
}

export async function toggleShippingOption(id: string, isActive: boolean) {
  const option = await prisma.shippingOptionSetting.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/dashboard/settings/shipping-options');
  return option;
}

export async function seedShippingOptions() {
  const defaults = [
    { name: 'PICKUP', isActive: true },
    { name: 'LALAMOVE', isActive: true }
  ];
  for (const opt of defaults) {
    await prisma.shippingOptionSetting.upsert({
      where: { name: opt.name },
      update: {},
      create: opt
    });
  }
  return fetchShippingOptions();
}

// ==================== SCHEDULE CONFIG ====================

export async function fetchScheduleConfig() {
  let config = await prisma.scheduleConfig.findFirst();
  if (!config) {
    config = await prisma.scheduleConfig.create({
      data: {
        maxSlotsPerDay: 300,
        minDaysAdvance: 3
      }
    });
  }
  return config;
}

export async function updateScheduleConfig(data: {
  maxSlotsPerDay: number;
  minDaysAdvance: number;
}) {
  let config = await prisma.scheduleConfig.findFirst();
  if (config) {
    config = await prisma.scheduleConfig.update({
      where: { id: config.id },
      data
    });
  } else {
    config = await prisma.scheduleConfig.create({ data });
  }
  revalidatePath('/dashboard/settings/schedule-options');
  return config;
}

// ==================== HOLIDAYS ====================

export async function fetchHolidays() {
  const holidays = await prisma.holiday.findMany({
    orderBy: { date: 'desc' }
  });
  return holidays;
}

export async function createHoliday(data: { date: Date; name?: string }) {
  const holiday = await prisma.holiday.create({
    data: {
      date: data.date,
      name: data.name || null
    }
  });
  revalidatePath('/dashboard/settings/schedule-options');
  return holiday;
}

export async function deleteHoliday(id: string) {
  await prisma.holiday.delete({ where: { id } });
  revalidatePath('/dashboard/settings/schedule-options');
}
