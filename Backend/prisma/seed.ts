import "dotenv/config";
import { prisma } from "../src/db";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@rednordeste.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

async function main() {
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminId = "admin-1";
  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      id: adminId,
      email: ADMIN_EMAIL,
      passwordHash,
      name: "Administrador",
    },
    update: { passwordHash, name: "Administrador" },
  });

  console.log("Seed completed: usuarios, empresas y vacantes eliminados; admin creado.");
  console.log("Admin: email =", ADMIN_EMAIL, "| contraseña =", ADMIN_PASSWORD);
  console.log("Para cambiar: ADMIN_EMAIL y ADMIN_PASSWORD en .env antes de ejecutar el seed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
