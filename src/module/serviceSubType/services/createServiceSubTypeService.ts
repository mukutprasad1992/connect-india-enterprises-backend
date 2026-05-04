import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceSubTypeDTO } from '../serviceSubTypeDTO/createServiceSubTypeDTO';
import { ServiceSubTypeSchema } from '../serviceSubTypeEntity/serviceSubTypeEntity';
import {
  anErrorOccurredWhileCreatingTheServiceSubType,
  createServiceSubTypeSuccessfully,
  errorWhileCreatingServiceSubTypeByUserID,
  failedToRetrieveLastInsertedServiceSubTypeIDAfterCreationByUserID,
  failedToRetrieveTheLastInsertedServiceSubTypeID,
  fetchingServiceSubTypeByID,
  initiatedServiceSubTypeCreationWithLedgerType,
  serviceSubTypeCreatedSuccessfullyByUserID,
  serviceSubTypeSuccessfullyRetrievedAfterCreationID,
} from '../common/serviceSubTypeMessage';
import { AppLogger } from 'src/utils/common/loggerService';

@Injectable()
export class CreateServiceSubTypeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {}

  async getInvestmentById(
    ledgerId: number,
  ): Promise<ServiceSubTypeSchema | null> {
    this.logger.doLog(`${fetchingServiceSubTypeByID} ${ledgerId}`, 'info');
    const investment = await this.dataSource.query(
      'SELECT * FROM servicesubtypes WHERE id = ?',
      [ledgerId],
    );
    return investment.length > 0 ? investment[0] : null;
  }

  async createServiceSubType(
    ServiceSubTypeDTO: ServiceSubTypeDTO,
    userId: number,
  ): Promise<any> {
    const { ledgerType, serviceId } = ServiceSubTypeDTO;
    const createdBy = userId;
    const query = `INSERT INTO servicesubtypes (ledgerType, serviceId, createdBy, createdAt)
                       VALUES (?, ?, ?, now())`;

    const values = [ledgerType, serviceId, createdBy];

    this.logger.doLog(
      `User ID: ${userId} ${initiatedServiceSubTypeCreationWithLedgerType} "${ledgerType}" and serviceId: ${serviceId}`,
      'info',
    );

    try {
      await this.dataSource.query(query, values);
      this.logger.doLog(
        `${serviceSubTypeCreatedSuccessfullyByUserID} ${userId}`,
        'success',
      );

      const lastInsertResult = await this.dataSource.query(
        'SELECT LAST_INSERT_ID() as id',
      );
      const ledgerId = lastInsertResult[0]?.id;

      if (!ledgerId) {
        this.logger.doLog(
          `${failedToRetrieveLastInsertedServiceSubTypeIDAfterCreationByUserID} ${userId}`,
          'warn',
        );
        return {
          status: false,
          message: failedToRetrieveTheLastInsertedServiceSubTypeID,
        };
      }

      const createdServiceSubType = await this.getInvestmentById(ledgerId);

      this.logger.doLog(
        `${serviceSubTypeSuccessfullyRetrievedAfterCreationID} ${ledgerId}, Created By: ${userId}`,
        'success',
      );

      return {
        status: true,
        message: createServiceSubTypeSuccessfully,
        data: createdServiceSubType,
      };
    } catch (error: any) {
      this.logger.doLog(
        `${errorWhileCreatingServiceSubTypeByUserID} ${userId} — ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: anErrorOccurredWhileCreatingTheServiceSubType,
        error: error.message,
      };
    }
  }
}
