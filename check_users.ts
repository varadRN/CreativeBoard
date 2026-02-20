
import { prisma } from './server/src/config/database';

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users found:', users);
    } catch (e) {
        console.error('Error fetching users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
