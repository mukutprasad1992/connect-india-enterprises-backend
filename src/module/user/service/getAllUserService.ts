import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import { AppLogger } from 'src/utils/common/loggerService';
import {
    usersRetrievedSuccessfully,
    errorOccurredWhileFetchingUsers,
    userNotFound,
    fetchingAllUsersFromDatabase,
    usersRetrievedSuccessfullyCount,
    noUsersFoundInTheDatabase
} from '../common/userMessage';

@Injectable()
export class GetAllUserService {
    constructor(
        @InjectRepository(UserSchema) private userRepository: Repository<UserSchema>,
        private readonly logger: AppLogger
    ) { }

    async getAllUser(): Promise<any> {
        this.logger.doLog(fetchingAllUsersFromDatabase, 'info');

        try {
            const query = 'SELECT * FROM users ORDER BY id DESC';
            const allUser = await this.userRepository.query(query);

            if (allUser.length > 0) {
                this.logger.doLog(`${usersRetrievedSuccessfullyCount} ${allUser.length}`, 'success');
                return {
                    status: true,
                    message: usersRetrievedSuccessfully,
                    data: allUser
                };
            } else {
                this.logger.doLog(noUsersFoundInTheDatabase, 'warn');
                return {
                    status: false,
                    message: userNotFound,
                    data: null
                };
            }
        } catch (error) {
            this.logger.doLog(`${errorOccurredWhileFetchingUsers} ${error.message}`, 'error');
            return {
                status: false,
                message: errorOccurredWhileFetchingUsers,
                data: null
            };
        }
    }
}
