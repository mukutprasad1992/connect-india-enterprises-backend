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
    attemptingToDeleteProfileImageForUserId,
    clearingProfileImageFieldsFromDatabaseForUserId,
    deletedVersion,
    deletingProfileImageFromS3ForUserId,
    errorDeletingFileFromS3Key,
    fetchingObjectVersionsForKey,
    invalidBucketOrKeyWhileDeletingFromS3Bucket,
    noProfileImageFoundForUserId,
    notFound,
    profileImageDeletedSuccessfully,
    profileImageDeletedSuccessfullyForUserId,
    profileImageNotFound,
    successfullyDeletedAllVersionsOfKey,
    userWithID,
    versionsForKey
} from '../common/message/messageFileUpload';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class DeleteProfileImageService {
    constructor(
        @InjectRepository(UserSchema)
        private readonly userRepository: Repository<UserSchema>,
        private readonly logger: AppLogger,
    ) { }

    private async deleteFileFromS3(key: string) {
        const bucket = process.env.AWS_BUCKET_NAME;

        if (!bucket || !key) {
            this.logger.doLog(`${invalidBucketOrKeyWhileDeletingFromS3Bucket} = ${bucket}, key=${key}`, 'warn');
            return;
        }

        try {
            this.logger.doLog(`${fetchingObjectVersionsForKey} ${key}`, 'info');
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

            this.logger.doLog(`Found ${allVersions.length} ${versionsForKey} ${key}`, 'info');

            for (const version of allVersions) {
                if (version.Key === key && version.VersionId) {
                    await s3.send(
                        new DeleteObjectCommand({
                            Bucket: bucket,
                            Key: key,
                            VersionId: version.VersionId,
                        }),
                    );
                    this.logger.doLog(`${deletedVersion} ${version.VersionId} of key: ${key}`, 'success');
                }
            }

            this.logger.doLog(`${successfullyDeletedAllVersionsOfKey} ${key}`, 'success');
        } catch (error) {
            this.logger.doLog(
                `${errorDeletingFileFromS3Key} ${key}, Error: ${error.message}`,
                'error'
            );
            return {
                status: false,
                message: anUnexpectedErrorOccurredWhileDeletingTheFileFromS3,
                error: error.message,
            };
        }
    }

    async deleteProfileImage(userId: number) {
        this.logger.doLog(`${attemptingToDeleteProfileImageForUserId} ${userId}`, 'info');

        const users = await this.userRepository.query(
            'SELECT id, profileImageKey, profileImageURL FROM users WHERE id = ?',
            [userId],
        );
        const user = users[0];

        if (!user) {
            this.logger.doLog(`${userWithID} ${userId} ${notFound}`, 'warn');
            return {
                status: false,
                message: profileImageNotFound,
            };
        }

        if (!user.profileImageKey) {
            this.logger.doLog(`${noProfileImageFoundForUserId} ${userId}`, 'warn');
            return {
                status: false,
                message: profileImageNotFound,
            };
        }

        this.logger.doLog(`${deletingProfileImageFromS3ForUserId} ${userId}, key: ${user.profileImageKey}`, 'info');
        await this.deleteFileFromS3(user.profileImageKey);

        this.logger.doLog(`${clearingProfileImageFieldsFromDatabaseForUserId} ${userId}`, 'info');
        await this.userRepository.query(
            'UPDATE users SET profileImageKey = NULL, profileImageURL = NULL WHERE id = ?',
            [userId],
        );

        this.logger.doLog(`${profileImageDeletedSuccessfullyForUserId} ${userId}`, 'success');
        return {
            status: true,
            message: profileImageDeletedSuccessfully,
        };
    }
}
