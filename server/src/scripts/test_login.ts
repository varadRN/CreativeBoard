
import { comparePassword } from '../utils/hash';
import { prisma } from '../config/database';

async function testLogin() {
    try {
        const email = 'test_debug@test.com';
        const password = 'Password123!';

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`Testing password '${password}' against hash '${user.passwordHash}'`);
        const isMatch = await comparePassword(password, user.passwordHash);
        console.log(`Match result: ${isMatch}`);

        if (isMatch) {
            console.log('LOGIN SUCCESS (Internal)');
        } else {
            console.log('LOGIN FAILED (Internal)');
        }

    } catch (e) {
        console.error('Error testing login:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
