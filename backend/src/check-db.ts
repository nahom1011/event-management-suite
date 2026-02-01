import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const events = await prisma.event.findMany({
        include: {
            ticketTypes: true,
            organizer: true
        }
    });
    const fs = require('fs');
    fs.writeFileSync('db-state.json', JSON.stringify(events, null, 2));
    console.log('Database State saved to db-state.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
