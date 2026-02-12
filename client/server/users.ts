'use server';
import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

interface FetchUsersParams {
  page: number;
  limit: number;
  search?: string | null;
  role?: string | null;
}

export async function fetchUsers({ page, limit, search, role }: FetchUsersParams) {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
      {
        UserInformation: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { studentNo: { contains: search } }
          ]
        }
      }
    ];
  }
  if (role && (role === 'ADMIN' || role === 'STUDENT')) {
    where.role = role;
  }

  const [users, totalUsers] = await Promise.all([
    prisma.users.findMany({
      where,
      include: {
        UserInformation: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.users.count({ where })
  ]);

  return { users, totalUsers };
}

export async function createUser(data: {
  email: string;
  password: string;
  role: 'STUDENT' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  studentNo?: string;
  lrn?: string;
  address?: string;
  phoneNo?: string;
  middleName?: string;
}) {
  const existing = await prisma.users.findUnique({
    where: { email: data.email }
  });
  if (existing) throw new Error('Email already exists');

  const hashedPassword = await hash(data.password, 12);

  const user = await prisma.users.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role,
      emailVerified: true
    }
  });

  // Create UserInformation if student fields provided
  if (data.firstName && data.lastName) {
    await prisma.userInformation.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        studentNo: data.studentNo || '',
        lrn: data.lrn || '',
        address: data.address || '',
        phoneNo: data.phoneNo || '',
        userId: user.id
      }
    });
  }

  revalidatePath('/dashboard/settings/user-management');
  return user;
}

export async function updateUser(
  userId: string,
  data: {
    email?: string;
    role?: 'STUDENT' | 'ADMIN';
    password?: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    studentNo?: string;
    lrn?: string;
    address?: string;
    phoneNo?: string;
  }
) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const updateData: any = {};
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;
  if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
  if (data.password) updateData.password = await hash(data.password, 12);

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: updateData
  });

  // Update or create UserInformation
  if (data.firstName || data.lastName || data.studentNo || data.phoneNo) {
    const existing = await prisma.userInformation.findUnique({
      where: { userId }
    });
    if (existing) {
      await prisma.userInformation.update({
        where: { userId },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.middleName !== undefined && { middleName: data.middleName || null }),
          ...(data.studentNo && { studentNo: data.studentNo }),
          ...(data.lrn && { lrn: data.lrn }),
          ...(data.address && { address: data.address }),
          ...(data.phoneNo && { phoneNo: data.phoneNo })
        }
      });
    } else if (data.firstName && data.lastName) {
      await prisma.userInformation.create({
        data: {
          firstName: data.firstName,
          middleName: data.middleName || null,
          lastName: data.lastName,
          studentNo: data.studentNo || '',
          lrn: data.lrn || '',
          address: data.address || '',
          phoneNo: data.phoneNo || '',
          userId
        }
      });
    }
  }

  revalidatePath('/dashboard/settings/user-management');
  return updatedUser;
}

export async function deleteUser(userId: string) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  await prisma.users.delete({ where: { id: userId } });
  revalidatePath('/dashboard/settings/user-management');
}

export async function toggleUserRole(userId: string) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const newRole = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath('/dashboard/settings/user-management');
  return updatedUser;
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const hashedPassword = await hash(newPassword, 12);
  await prisma.users.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  revalidatePath('/dashboard/settings/user-management');
}
