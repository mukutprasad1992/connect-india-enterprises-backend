import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import {
    vendorsRetrievedSuccessfully,
    errorOccurredWhileFetchingVendors,
    vendorsNotFound
} from '../common/userMessage'
@Injectable()
export class GetAllVendorService {
    constructor(
        @InjectRepository(UserSchema) private userRepository: Repository<UserSchema>,
    ) { }

    async getAllVendor(): Promise<any> {
        try {
            const query = `SELECT u.id, u.firstName, u.lastName, u.email, u.mobileNo,
             u.roleId, u.businessName, u.businessRepresentative, u.address, 
             u.vendorCode, u.pinCode, u.status,  u.dateOfBirth, u.profileImageURL, u.createdAt
             FROM users u WHERE roleId = 2 ORDER BY id DESC;`;

            const allUser = await this.userRepository.query(query);
            if (allUser.length > 0) {
                return {
                    status: true,
                    message: vendorsRetrievedSuccessfully,
                    data: allUser
                };
            }
            else {
                return {
                    status: false,
                    message: vendorsNotFound,
                    data: null
                };
            }
        } catch (error) {
            return {
                status: false,
                message: error.message,
                data: null
            }
        }
    }
}
