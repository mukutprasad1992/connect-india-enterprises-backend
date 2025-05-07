import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    anErrorOccurredWhileRetrievingServiceSubType,
    anErrorOccurredWhileUpdatingServiceSubType,
    serviceSubTypeNotFound,
    serviceSubTypeRetrievalSuccessfully,
    serviceSubTypeUpdateSuccessfully
} from '../common/serviceSubTypeMessage'
@Injectable()
export class UpdateServiceSubTypeByIdService {
    constructor(private readonly dataSource: DataSource) { }

    async updateServiceSubTypeById(ledgerId: number): Promise<any> {
        try {
            const serviceSubType = await this.dataSource.query(
                'SELECT * FROM serviceSubTypes WHERE id = ?',
                [ledgerId]
            );
            if (!serviceSubType[0]) {
                return {
                    status: false,
                    message: serviceSubTypeNotFound,
                    data: null
                }
            }
            else {
                return {
                    status: true,
                    message: serviceSubTypeRetrievalSuccessfully,
                    data: serviceSubType
                }
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileRetrievingServiceSubType,
                data: null,
                error: error.message
            }
        }
    }
    async updateServiceSubType(ledgerId: number, updatedData: any, userId: number): Promise<any> {
        try {
            const updatedBy = userId;
            const profile = await this.updateServiceSubTypeById(ledgerId);
            if (!profile || !profile.data) {
                return {
                    status: false,
                    message: serviceSubTypeNotFound,
                    data: null
                };
            }

            const { ledgerType } = updatedData;
            const query = `UPDATE serviceSubTypes 
               SET ledgerType = ?, updatedBy = ?, updatedAt = now()
               WHERE id = ?`;
            const values = [
                ledgerType,
                updatedBy,
                ledgerId
            ];
            await this.dataSource.query(query, values);
            const updatedProfile = await this.updateServiceSubTypeById(ledgerId);

            return {
                status: true,
                message: serviceSubTypeUpdateSuccessfully,
                data: updatedProfile.data
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileUpdatingServiceSubType,
                error: error.message
            };
        }
    }
}