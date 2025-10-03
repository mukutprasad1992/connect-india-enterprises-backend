import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from '../userEntity/userSchema';
import {
    anErrorOccurredWhileRetrievingTheUser,
    userRetrievedSuccessfully,
    userNotFound
} from '../common/userMessage';
@Injectable()
export class GetUserByIdService {
    constructor(
        @InjectRepository(UserSchema) private userRepository: Repository<UserSchema>,
    ) { }

    async getUserById(id: number): Promise<any> {
        try {
            const query = 'SELECT * FROM users WHERE id = ? ORDER BY id DESC';
            const user = await this.userRepository.query(query, [id]);
            if (user.length > 0) {
                return {
                    status: true,
                    message: userRetrievedSuccessfully,
                    data: user[0]
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
