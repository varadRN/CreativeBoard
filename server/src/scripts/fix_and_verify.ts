
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash';

async function fixAndVerify() {
    try {
        const email = 'varadnakhate289@gmail.com';
        const newPassword = 'password123';

        console.log(`[1] Finding user ${email}...`);
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error('USER NOT FOUND!');
            return;
        }

        console.log(`[2] Resetting password to '${newPassword}'...`);
        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        });

        console.log('[3] Verifying update...');
        const updatedUser = await prisma.user.findUnique({ where: { email } });

        if (!updatedUser) {
            console.error('Error fetching updated user');
            return;
        }

        const isMatch = await comparePassword(newPassword, updatedUser.passwordHash);

        if (isMatch) {
            console.log('SUCCESS: Password reset and verified internally.');
            console.log(`You can now login with: ${email} / ${newPassword}`);
        } else {
            console.error('FAILURE: Password mismatch after reset! Hashing not working?');
        }

    } catch (e) {
        console.error('Error in fix script:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fixAndVerify();
