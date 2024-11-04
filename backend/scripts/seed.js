// backend/scripts/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Crée un utilisateur de test
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "123456", // À chiffrer pour la production
    },
  });

  // Crée un pays de test
  const france = await prisma.country.create({
    data: {
      name: "France",
      code: "FR",
    },
  });

  console.log({ user, france });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });