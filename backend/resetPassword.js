const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  
  // 1. Force update password for ramiro (ADMIN)
  const user = await prisma.user.update({
    where: { email: 'ramiro@gmail.com' },
    data: { passwordHash: hash }
  });
  console.log(`Password reset for ${user.email} (Admin).`);

  // 2. Force update password for juan (PROVIDER)
  const user2 = await prisma.user.update({
    where: { email: 'juan@prestador.com' },
    data: { passwordHash: hash }
  });
  console.log(`Password reset for ${user2.email} (Provider).`);

  // 3. Force update password for pedro (test soft delete)
  const user3 = await prisma.user.update({
    where: { email: 'pedro@gmail.com' },
    data: { passwordHash: hash, isDeleted: false } // ensure he is not deleted yet
  });
  console.log(`Password reset for ${user3.email} (Test Provider).`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
