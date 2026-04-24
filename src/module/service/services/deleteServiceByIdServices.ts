import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  serviceDeletionError,
  serviceDeletedSuccessfully,
  servicesNotFoundOrAlreadyDeleted,
} from '../common/serviceMessage';

@Injectable()
export class DeleteServiceByIdService {
  constructor(private readonly dataSource: DataSource) {}

  async deleteServiceById(id: number): Promise<any> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM services WHERE id = ?`,
        [id],
      );
      if (result.affectedRows === 0) {
        return {
          status: false,
          message: servicesNotFoundOrAlreadyDeleted,
        };
      }
      return {
        message: serviceDeletedSuccessfully,
        status: true,
      };
    } catch (error: any) {
      return {
        status: false,
        message: serviceDeletionError,
        error: error.message,
      };
    }
  }
}
