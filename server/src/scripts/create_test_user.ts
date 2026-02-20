
import { prisma } from '../config/database';
import { hashPassword } from '../utils/hash';

async function createTestUser() {
    try {
        const email = 'test_debug@test.com';
        const password = 'Password123!';
        const hashedPassword = await hashPassword(password);

        // Delete if exists
        await prisma.user.deleteMany({ where: { email } });

        const user = await prisma.user.create({
            data: {
                email,
                fullName: 'Test User',
                passwordHash: hashedPassword,
                emailVerified: true
            }
        });
        console.log(`Created test user: ${email} with password: ${password}`);
        console.log(`Hash: ${hashedPassword}`);

    } catch (e) {
        console.error('Error creating test user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
