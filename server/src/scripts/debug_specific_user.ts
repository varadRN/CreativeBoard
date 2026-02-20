
import { prisma } from '../config/database';
import { comparePassword, hashPassword } from '../utils/hash';

async function debugSpecificUser() {
    const email = 'varadnakhate289@gmail.com';
    const password = 'password123';

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('❌ User NOT FOUND in DB');
            return;
        }
        console.log(`✅ User FOUND: ${user.id}`);
        console.log(`Stored Hash: ${user.passwordHash.substring(0, 10)}...`);

        const isMatch = await comparePassword(password, user.passwordHash);
        console.log(`PW Match for '${password}': ${isMatch ? '✅ YES' : '❌ NO'}`);

        if (!isMatch) {
            // Let's try to reset it AGAIN just to be 1000% sure
            console.log('🔄 Re-hashing and resetting password...');
            const newHash = await hashPassword(password);
            await prisma.user.update({
                where: { email },
                data: { passwordHash: newHash }
            });
            console.log('✅ Password Reset Complete');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debugSpecificUser();
