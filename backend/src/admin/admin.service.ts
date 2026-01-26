import { PrismaClient, type Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { AuditLogger } from '../utils/AuditLogger';

const prisma = new PrismaClient();

export class AdminService {
    async reviewOrganizerApplication(adminId: string, profileId: string, status: 'approved' | 'rejected') {
        const profile = await prisma.organizerProfile.findUnique({
            where: { id: profileId },
            include: { user: true },
        });

        if (!profile) throw new AppError('Application not found', 404);
        if (profile.verificationStatus !== 'pending') {
            throw new AppError('This application has already been reviewed', 400);
        }

        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const updatedProfile = await tx.organizerProfile.update({
                where: { id: profileId },
                data: { verificationStatus: status },
            });

            if (status === 'approved') {
                await tx.user.update({
                    where: { id: profile.userId },
                    data: { role: 'organizer' },
                });
            }

            await AuditLogger.log({
                actorId: adminId,
                action: 'REVIEW_ORGANIZER_APPLICATION',
                target: profile.userId,
                details: { profileId, status },
            });

            return updatedProfile;
        });
    }

    async getPendingApplications() {
        return await prisma.organizerProfile.findMany({
            where: { verificationStatus: 'pending' },
            include: { user: { select: { name: true, email: true } } },
        });
    }

    async reviewEvent(adminId: string, eventId: string, status: 'approved' | 'live' | 'cancelled') {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) throw new AppError('Event not found', 404);

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { status: status as any }, // Using 'any' here as a temporary fix for EventStatus enum cast
        });

        await AuditLogger.log({
            actorId: adminId,
            action: 'REVIEW_EVENT',
            target: eventId,
            details: { status },
        });

        return updatedEvent;
    }

    async getPendingEvents() {
        return await prisma.event.findMany({
            where: { status: 'pending' },
            include: {
                organizer: {
                    include: { user: { select: { name: true } } }
                },
                tickets: true
            },
        });
    }

    async getAllUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                isBanned: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async toggleUserActive(adminId: string, userId: string, isActive: boolean) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });

        await AuditLogger.log({
            actorId: adminId,
            action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            target: userId,
        });

        return user;
    }

    async toggleUserBan(adminId: string, userId: string, isBanned: boolean) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isBanned },
        });

        await AuditLogger.log({
            actorId: adminId,
            action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
            target: userId,
        });

        return user;
    }

    async getAuditLogs() {
        return await prisma.auditLog.findMany({
            include: {
                actor: { select: { name: true, email: true, role: true } }
            },
            orderBy: { timestamp: 'desc' },
            take: 100
        });
    }

    async changeUserRole(adminId: string, userId: string, newRole: string) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole as any },
        });

        await AuditLogger.log({
            actorId: adminId,
            action: 'CHANGE_USER_ROLE',
            target: userId,
            details: { newRole },
        });

        return user;
    }

    async emergencyKillSwitch(adminId: string, status: boolean) {
        // Logic to disable the entire platform (e.g., updating a global setting in DB or Redis)
        await AuditLogger.log({
            actorId: adminId,
            action: status ? 'EMERGENCY_DISABLE' : 'EMERGENCY_ENABLE',
            details: { timestamp: new Date() },
        });
        return { maintenanceMode: status };
    }
}
