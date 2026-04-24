import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateServiceDTO } from '../serviceDTO/createServiceDTO';
import { ServiceSchema } from '../serviceEntity/serviceEntity';
import { UserSchema } from '../../user/userEntity/userSchema';
import {
  userNotFound,
  serviceCreatedSuccessfully,
  serviceCreationError,
  failedToRetrieveTheLastInsertedServiceID,
} from '../common/serviceMessage';

@Injectable()
export class CreateServiceService {
  constructor(private readonly dataSource: DataSource) {}

  async getServiceById(id: number): Promise<ServiceSchema | null> {
    const service = await this.dataSource.query(
      'SELECT * FROM services WHERE id = ?',
      [id],
    );
    return service.length > 0 ? service[0] : null;
  }
  async createService(
    userId: number,
    createServiceDTO: CreateServiceDTO,
  ): Promise<any> {
    const { serviceType } = createServiceDTO;
    const createdBy = userId;
    const query = `INSERT INTO services (serviceType, createdBy, createdAt)
                   VALUES (?, ?, now())`;
    const values = [serviceType, createdBy];

    try {
      await this.dataSource.query(query, values);
      const lastInsertResult = await this.dataSource.query(
        'SELECT LAST_INSERT_ID() as id',
      );
      const lastInsertedId = lastInsertResult[0]?.id;

      if (!lastInsertedId) {
        return {
          status: false,
          message: failedToRetrieveTheLastInsertedServiceID,
        };
      }
      const createdService = await this.getServiceById(lastInsertedId);
      return {
        status: true,
        message: serviceCreatedSuccessfully,
        data: createdService,
      };
    } catch (error: any) {
      return {
        status: false,
        message: serviceCreationError,
        error: error.message,
      };
    }
  }
}
