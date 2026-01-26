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
            // 1. Update verification status
            const updatedProfile = await tx.organizerProfile.update({
                where: { id: profileId },
                data: { verificationStatus: status },
            });

            // 2. If approved, change the user's role
            if (status === 'approved') {
                await tx.user.update({
                    where: { id: profile.userId },
                    data: { role: 'organizer' },
                });
            }

            // 3. Log the action
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
}
