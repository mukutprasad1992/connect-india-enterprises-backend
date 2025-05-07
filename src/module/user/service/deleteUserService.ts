import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserSchema } from "../userEntity/userSchema";
import { DataSource, Repository } from "typeorm";
import {
    userNotFound,
    userSuccessfullyDeleted,
    errorOccurredWhileDeletingTheUser
} from '../common/userMessage';
@Injectable()
export class DeleteUserService {
    constructor(
        @InjectRepository(UserSchema) private userRepository: Repository<UserSchema>,
        private dataSource: DataSource,
    ) { }

    async delete(userId: number): Promise<any> {
        const query = 'DELETE FROM users WHERE id = ?';
        const values = [userId];

        try {
            const deleteResult = await this.dataSource.query(query, values);
            if (deleteResult.affectedRows === 0) {
                return {
                    status: false,
                    message: userNotFound,
                    data: null
                }
            }
            else {
                return {
                    status: true,
                    message: userSuccessfullyDeleted,
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
