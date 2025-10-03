import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import {
    usersRetrievedSuccessfully,
    errorOccurredWhileFetchingUsers,
    userNotFound
} from '../common/userMessage'
@Injectable()
export class GetAllUserService {
    constructor(
        @InjectRepository(UserSchema) private userRepository: Repository<UserSchema>,
    ) { }

    async getAllUser(): Promise<any> {
        try {
            const query = 'SELECT * FROM users ORDER BY id DESC';
            const allUser = await this.userRepository.query(query);
            if (allUser.length > 0) {
                return {
                    status: true,
                    message: usersRetrievedSuccessfully,
                    data: allUser
                };
            }
            else {
                return {
                    status: false,
                    message: userNotFound,
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
