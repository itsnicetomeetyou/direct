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

export async function createPaymentOption(name: string) {
  const normalized = name.toUpperCase().replace(/\s+/g, '_');
  const option = await prisma.paymentOptionSetting.create({
    data: { name: normalized, isActive: true }
  });
  revalidatePath('/dashboard/settings/payment-options');
  return option;
}

export async function deletePaymentOption(id: string) {
  await prisma.paymentOptionSetting.delete({ where: { id } });
  revalidatePath('/dashboard/settings/payment-options');
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

export async function createShippingOption(name: string) {
  const normalized = name.toUpperCase().replace(/\s+/g, '_');
  const option = await prisma.shippingOptionSetting.create({
    data: { name: normalized, isActive: true }
  });
  revalidatePath('/dashboard/settings/shipping-options');
  return option;
}

export async function deleteShippingOption(id: string) {
  await prisma.shippingOptionSetting.delete({ where: { id } });
  revalidatePath('/dashboard/settings/shipping-options');
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

// ==================== ORDER STATUS SETTINGS ====================

export async function fetchOrderStatuses() {
  const statuses = await prisma.orderStatusSetting.findMany({
    orderBy: { createdAt: 'asc' }
  });
  return statuses;
}

export async function toggleOrderStatus(id: string, isActive: boolean) {
  const status = await prisma.orderStatusSetting.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/dashboard/settings/order-status');
  return status;
}

export async function createOrderStatus(name: string) {
  const status = await prisma.orderStatusSetting.create({
    data: { name: name.toUpperCase().replace(/\s+/g, ''), isActive: true }
  });
  revalidatePath('/dashboard/settings/order-status');
  return status;
}

export async function deleteOrderStatus(id: string) {
  await prisma.orderStatusSetting.delete({ where: { id } });
  revalidatePath('/dashboard/settings/order-status');
}

export async function seedOrderStatuses() {
  const defaults = [
    { name: 'PENDING', isActive: true },
    { name: 'PAID', isActive: true },
    { name: 'PROCESSING', isActive: true },
    { name: 'READYTOPICKUP', isActive: true },
    { name: 'OUTFORDELIVERY', isActive: true },
    { name: 'COMPLETED', isActive: true },
    { name: 'CANCELLED', isActive: true }
  ];
  for (const s of defaults) {
    try {
      await prisma.orderStatusSetting.upsert({
        where: { name: s.name },
        update: {},
        create: s
      });
    } catch (e: any) {
      if (e?.code !== 'P2002') throw e;
    }
  }
  return fetchOrderStatuses();
}

// ==================== ROLE PERMISSIONS ====================

// All configurable tab keys matching navItems labels
const ALL_TAB_KEYS = [
  'Dashboard',
  'transaction-list',
  'order-list',
  'settings',
  'payment-options',
  'shipping-options',
  'schedule-options',
  'user-management',
  'order-status',
  'roles-management'
];

// ==================== ROLE DEFINITIONS ====================

export async function fetchRoleDefinitions() {
  // Seed default roles if none exist
  const count = await prisma.roleDefinition.count();
  if (count === 0) {
    for (const r of [
      { name: 'ADMIN', isDefault: true },
      { name: 'STUDENT', isDefault: true }
    ]) {
      try {
        await prisma.roleDefinition.upsert({
          where: { name: r.name },
          update: {},
          create: r
        });
      } catch (e: any) {
        if (e?.code !== 'P2002') throw e;
      }
    }
  }
  return prisma.roleDefinition.findMany({
    orderBy: { createdAt: 'asc' }
  });
}

export async function createRoleDefinition(name: string) {
  const normalized = name.toUpperCase().replace(/\s+/g, '_');
  const role = await prisma.roleDefinition.create({
    data: { name: normalized, isDefault: false }
  });
  // Seed permissions for the new role (all denied by default)
  for (const tabKey of ALL_TAB_KEYS) {
    try {
      await prisma.rolePermission.upsert({
        where: { role_tabKey: { role: normalized, tabKey } },
        update: {},
        create: { role: normalized, tabKey, canAccess: false }
      });
    } catch (e: any) {
      if (e?.code !== 'P2002') throw e;
    }
  }
  revalidatePath('/dashboard/settings/roles-management');
  return role;
}

export async function deleteRoleDefinition(id: string) {
  const role = await prisma.roleDefinition.findUnique({ where: { id } });
  if (!role) throw new Error('Role not found');
  if (role.isDefault) throw new Error('Cannot delete default roles');
  // Delete all permissions for this role
  await prisma.rolePermission.deleteMany({ where: { role: role.name } });
  // Reset any users with this role back to STUDENT
  await prisma.users.updateMany({
    where: { role: role.name },
    data: { role: 'STUDENT' }
  });
  await prisma.roleDefinition.delete({ where: { id } });
  revalidatePath('/dashboard/settings/roles-management');
}

// ==================== ROLE PERMISSIONS ====================

export async function fetchRolePermissions(role: string) {
  // Seed defaults if missing
  for (const tabKey of ALL_TAB_KEYS) {
    try {
      await prisma.rolePermission.upsert({
        where: { role_tabKey: { role, tabKey } },
        update: {},
        create: {
          role,
          tabKey,
          canAccess: role === 'ADMIN' ? true : false
        }
      });
    } catch (e: any) {
      if (e?.code !== 'P2002') throw e;
    }
  }
  return prisma.rolePermission.findMany({
    where: { role },
    orderBy: { createdAt: 'asc' }
  });
}

export async function toggleRolePermission(id: string, canAccess: boolean) {
  const perm = await prisma.rolePermission.update({
    where: { id },
    data: { canAccess }
  });
  revalidatePath('/dashboard/settings/roles-management');
  return perm;
}

export async function getPermissionsForRole(role: string) {
  const permissions = await prisma.rolePermission.findMany({
    where: { role }
  });

  // Build a map of configured permissions
  const permMap = new Map(permissions.map((p) => [p.tabKey, p.canAccess]));

  // For any tab key NOT yet configured in DB:
  // - ADMIN defaults to allowed (true)
  // - Other roles default to denied (false)
  const allowedTabs: string[] = [];
  for (const tabKey of ALL_TAB_KEYS) {
    const configured = permMap.get(tabKey);
    if (configured !== undefined) {
      if (configured) allowedTabs.push(tabKey);
    } else {
      if (role === 'ADMIN') allowedTabs.push(tabKey);
    }
  }

  return allowedTabs;
}
