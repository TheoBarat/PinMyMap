const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.statusColor.createMany({
    data: [
      { status: 'visited', color: '#00FF00' }, // Vert
      { status: 'wishlist', color: '#0000FF' }, // Bleu
    ],
  });
  console.log('Données initiales ajoutées');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });