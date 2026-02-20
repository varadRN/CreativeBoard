
import { prisma } from '../config/database';

async function checkUserFull() {
    const email = 'varadnakhate289@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(JSON.stringify(user, null, 2));
    await prisma.$disconnect();
}
checkUserFull();
