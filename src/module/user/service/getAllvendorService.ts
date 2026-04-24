import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  vendorsRetrievedSuccessfully,
  errorOccurredWhileFetchingVendors,
  vendorsNotFound,
  fetchingAllVendorsFromDatabase,
  vendorsRetrievedSuccessfullyCount,
  noVendorsFoundInTheDatabase,
} from '../common/userMessage';

@Injectable()
export class GetAllVendorService {
  constructor(
    @InjectRepository(UserSchema)
    private userRepository: Repository<UserSchema>,
    private readonly logger: AppLogger,
  ) {}

  async getAllVendor(): Promise<any> {
    this.logger.doLog(fetchingAllVendorsFromDatabase, 'info');

    try {
      const query = `SELECT u.id, u.firstName, u.lastName, u.email, u.mobileNo,
             u.roleId, u.businessName, u.businessRepresentative, u.address, 
             u.vendorCode, u.pinCode, u.status,  u.dateOfBirth, u.profileImageURL, u.createdAt
             FROM users u WHERE roleId = 2 ORDER BY id DESC;`;

      const allUser = await this.userRepository.query(query);

      if (allUser.length > 0) {
        this.logger.doLog(
          `${vendorsRetrievedSuccessfullyCount} ${allUser.length}`,
          'success',
        );
        return {
          status: true,
          message: vendorsRetrievedSuccessfully,
          data: allUser,
        };
      } else {
        this.logger.doLog(noVendorsFoundInTheDatabase, 'warn');
        return {
          status: false,
          message: vendorsNotFound,
          data: null,
        };
      }
    } catch (error: any) {
      this.logger.doLog(
        `${errorOccurredWhileFetchingVendors} ${error.message}`,
        'error',
      );
      return {
        status: false,
        message: errorOccurredWhileFetchingVendors,
        data: null,
      };
    }
  }
}
