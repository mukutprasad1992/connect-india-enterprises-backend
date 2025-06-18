import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    DeleteObjectCommand,
    ListObjectVersionsCommand,
} from '@aws-sdk/client-s3';
import { UserSchema } from '../../profile/profileEntity/profileSchema';
import { s3 } from '../../../config/awsConfig';
import {
    anUnexpectedErrorOccurredWhileDeletingTheFileFromS3,
    profileImageDeletedSuccessfully,
    profileImageNotFound
} from '../common/message/messageFileUpload';

@Injectable()
export class DeleteProfileImageService {
    constructor(
        @InjectRepository(UserSchema)
        private readonly userRepository: Repository<UserSchema>,
    ) { }

    private async deleteFileFromS3(key: string) {
        const bucket = process.env.AWS_BUCKET_NAME;
        if (!bucket || !key) return;

        try {
            const versions = await s3.send(
                new ListObjectVersionsCommand({
                    Bucket: bucket,
                    Prefix: key,
                }),
            );

            const allVersions = [
                ...(versions.Versions || []),
                ...(versions.DeleteMarkers || []),
            ];

            for (const version of allVersions) {
                if (version.Key === key && version.VersionId) {
                    await s3.send(
                        new DeleteObjectCommand({
                            Bucket: bucket,
                            Key: key,
                            VersionId: version.VersionId,
                        }),
                    );
                }
            }
        } catch (error) {
            return {
                status: false,
                message: anUnexpectedErrorOccurredWhileDeletingTheFileFromS3,
                error: error.message,
            };
        }
    }
    async deleteProfileImage(userId: number) {
        const users = await this.userRepository.query(
            'SELECT id, profileImageKey, profileImageURL FROM users WHERE id = ?',
            [userId],
        );
        const user = users[0];

        if (!user) {
            return {
                status: false,
                message: profileImageNotFound,
            };
        }
        await this.deleteFileFromS3(user.profileImageKey);
        await this.userRepository.query(
            'UPDATE users SET profileImageKey = NULL, profileImageURL = NULL WHERE id = ?',
            [userId],
        );

        return {
            status: true,
            message: profileImageDeletedSuccessfully,
        };
    }
}
