
import { prisma } from '../config/database';

async function checkBoardData() {
    const boardId = '4fb555d8-113a-458b-a7df-58a0d2f99452'; // From screenshot
    try {
        const board = await prisma.board.findUnique({
            where: { id: boardId }
        });

        if (!board) {
            console.log('❌ Board not found');
            return;
        }

        console.log(`✅ Board Found: ${board.title}`);
        console.log('Canvas Data Type:', typeof board.canvasData);
        if (board.canvasData) {
            console.log('Canvas Data Length:', JSON.stringify(board.canvasData).length);
            console.log('Canvas Data Preview:', JSON.stringify(board.canvasData).substring(0, 200));
        } else {
            console.log('❌ Canvas Data is NULL or EMPTY');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkBoardData();
