import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@agritrack.demo').toLowerCase();
  // Default matches offline demo credentials so devs aren’t surprised after enabling the API.
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log('Seed: admin already exists, skipping');
    return;
  }
  const passwordHash = await bcrypt.hash(password, ROUNDS);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'admin',
      name: 'System Admin',
      phone: '+256700000001',
      location: 'Kampala',
    },
  });
  console.log(`Seed: created admin ${email} (set SEED_ADMIN_PASSWORD in production)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
