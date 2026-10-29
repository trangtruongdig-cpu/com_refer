import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const seedEnvSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
});

function loadSeedEnv(): z.infer<typeof seedEnvSchema> {
  const parsed = seedEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      '❌ Seed: thiếu hoặc sai ADMIN_EMAIL / ADMIN_PASSWORD',
      parsed.error.flatten().fieldErrors,
    );
    process.exit(1);
  }
  return parsed.data;
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = loadSeedEnv();
  const email = ADMIN_EMAIL.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✔ Admin ${email} đã tồn tại, bỏ qua`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: 'Administrator',
      password: await bcrypt.hash(ADMIN_PASSWORD, 12),
      role: Role.ADMIN,
    },
  });
  console.log(`✔ Đã tạo tài khoản admin: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed thất bại', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
