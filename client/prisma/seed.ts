import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.users.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    return;
  }

  // Create admin user
  const hashedPassword = await hash('admin123', 12);
  const admin = await prisma.users.create({
    data: {
      email: 'admin@directplus.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true
    }
  });

  console.log('Admin user created:', admin.email);
  console.log('Login with:');
  console.log('  Email: admin@directplus.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
