import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditLogger {
    static async log(data: {
        actorId: string;
        action: string;
        target?: string;
        details?: any;
    }) {
        try {
            return await prisma.auditLog.create({
                data: {
                    actorId: data.actorId,
                    action: data.action,
                    target: data.target,
                    details: data.details,
                },
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
}
