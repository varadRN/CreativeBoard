
import { prisma } from '../config/database';
import { hashPassword } from '../utils/hash';

async function resetPassword() {
    try {
        const email = 'varadnakhate289@gmail.com';
        const newPassword = 'password123';
        const hashedPassword = await hashPassword(newPassword);

        const user = await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        });

        console.log(`Password reset for ${email} to '${newPassword}'`);

    } catch (e) {
        console.error('Error resetting password:', e);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
