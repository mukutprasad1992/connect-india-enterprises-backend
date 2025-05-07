import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceSubTypeDTO } from '../serviceSubTypeDTO/createServiceSubTypeDTO';
import { ServiceSubTypeSchema } from '../serviceSubTypeEntity/serviceSubTypeEntity';
import {
    anErrorOccurredWhileCreatingTheServiceSubType,
    createServiceSubTypeSuccessfully,
    failedToRetrieveTheLastInsertedServiceSubTypeID
} from '../common/serviceSubTypeMessage';

@Injectable()
export class CreateServiceSubTypeService {
    constructor(private readonly dataSource: DataSource) { }

    async getInvestmentById(ledgerId: number): Promise<ServiceSubTypeSchema | null> {
        const investment = await this.dataSource.query(
            'SELECT * FROM serviceSubTypes WHERE id = ?',
            [ledgerId]
        );
        return investment.length > 0 ? investment[0] : null;
    }
    async createServiceSubType(ServiceSubTypeDTO: ServiceSubTypeDTO, userId: number): Promise<any> {
        const { ledgerType, serviceId } = ServiceSubTypeDTO;
        const createdBy = userId;
        const query = `INSERT INTO serviceSubTypes (ledgerType, serviceId, createdBy, createdAt)
                       VALUES (?, ?, ?, now())`;

        const values = [
            ledgerType,
            serviceId,
            createdBy
        ];
        try {
            await this.dataSource.query(query, values);
            const lastInsertResult = await this.dataSource.query("SELECT LAST_INSERT_ID() as id");
            const ledgerId = lastInsertResult[0]?.id;
            if (!ledgerId) {
                return {
                    status: false,
                    message: failedToRetrieveTheLastInsertedServiceSubTypeID,
                };
            }
            const createdServiceSubType = await this.getInvestmentById(ledgerId);

            return {
                status: true,
                message: createServiceSubTypeSuccessfully,
                data: createdServiceSubType,
            };
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileCreatingTheServiceSubType,
                error: error.message,
            };
        }
    }
}
