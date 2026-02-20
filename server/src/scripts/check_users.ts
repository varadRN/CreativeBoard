
import { prisma } from '../config/database';
import { hashPassword } from '../utils/hash';

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- USERS IN DB ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}, ID: ${u.id}, Verified: ${u.emailVerified}`);
            // Don't log password hash
        });
        console.log('-------------------');

        // Check if the specific email exists
        const email = 'varadnakhate289@gmail.com'; // From screenshot
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            console.log(`User ${email} FOUND.`);
            console.log(`Hash: ${user.passwordHash.substring(0, 10)}...`);
        } else {
            console.log(`User ${email} NOT FOUND.`);
        }

    } catch (e) {
        console.error('Error fetching users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
