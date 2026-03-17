import "dotenv/config";
import prisma from "../src/db";
import bcrypt from "bcryptjs";

// Admin fijo para el proyecto (solo este admin).
const ADMIN_EMAIL = "alexpthramirez@gmail.com";
const ADMIN_PASSWORD = "Porotito123";

const ADMIN_NAME = "Administrador";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminId = "admin-1";

  // upsert por email: si existe, reemplaza la contraseña (y nombre).
  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      id: adminId,
      email: ADMIN_EMAIL,
      passwordHash,
      name: ADMIN_NAME,
    },
    update: { passwordHash, name: ADMIN_NAME },
  });

  console.log("Seed completed: admin upsert realizado.");
  console.log("Admin: email =", ADMIN_EMAIL, "| contraseña =", ADMIN_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
