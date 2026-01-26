import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class OrganizerService {
    async applyToBecomeOrganizer(userId: string, data: { organizationName: string; phone?: string; payoutDetails?: any }) {
        // 1. Check if an application or profile already exists
        const existingProfile = await prisma.organizerProfile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            throw new AppError('You have already submitted an application or are already an organizer', 400);
        }

        // 2. Create profile with "pending" status
        return await prisma.organizerProfile.create({
            data: {
                userId,
                organizationName: data.organizationName,
                phone: data.phone,
                payoutDetails: data.payoutDetails,
                verificationStatus: 'pending',
            },
        });
    }

    async getMyProfile(userId: string) {
        const profile = await prisma.organizerProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Organizer profile not found', 404);
        }

        return profile;
    }
}
