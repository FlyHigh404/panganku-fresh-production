// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash(process.env.PASSWORD_ADMIN!, 10)

  await prisma.user.upsert({
    where: { email: "admin@pangankufresh.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@pangankufresh.com",
      password: password,
      role: "ADMIN",
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
