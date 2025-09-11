import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDTO } from '../userDTO/createUserDTO';
import { UserSchema } from '../userEntity/userSchema';
import { DataSource, Repository } from "typeorm";
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MailService } from '../../../utils/mailer/authMailer';
import {
    userCreatedSuccessfully,
    anErrorOccurredWhileCreatingTheUser,
    emailIsAlreadyExist,
    mobileNoIsAlreadyExist,
    theCreateByFieldCannotBeUpdated,
    vendorCodeIsAlreadyExist
} from '../common/userMessage';

@Injectable()
export class UserCreateService {
    constructor(
        @InjectRepository(UserSchema) private userRepository: Repository<UserSchema>,
        private dataSource: DataSource,
        private mailService: MailService
    ) { }
    private generateRandomPassword(length: number = 10): string {
        if (length < 8) {
            length = 8;
        }

        const upperCaseCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerCaseCharacters = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const specialCharacters = '!@#$%^&*()_-+=<>?';
        const firstChar = upperCaseCharacters[Math.floor(Math.random() * upperCaseCharacters.length)];

        const lowerChar = lowerCaseCharacters[Math.floor(Math.random() * lowerCaseCharacters.length)];
        const numberChar = numbers[Math.floor(Math.random() * numbers.length)];
        const specialChar = specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

        const allCharacters = upperCaseCharacters + lowerCaseCharacters + numbers + specialCharacters;

        const remainingLength = length - 4;

        const remainingChars: string[] = [];
        for (let i = 0; i < remainingLength; i++) {
            remainingChars.push(allCharacters[Math.floor(Math.random() * allCharacters.length)]);
        }

        const shuffled = [firstChar, lowerChar, numberChar, specialChar, ...remainingChars].sort(() => Math.random() - 0.5);

        return shuffled.join('');
    }


    async isEmailExist(email: string): Promise<boolean> {
        const result = await this.dataSource.query(
            'SELECT 1 FROM users WHERE email = ? LIMIT 1',
            [email]
        );
        return result.length > 0;
    }

    async isMobileExist(mobileNo: string): Promise<boolean> {
        const result = await this.dataSource.query(
            'SELECT 1 FROM users WHERE mobileNo = ? LIMIT 1',
            [mobileNo]
        );
        return result.length > 0;
    }

    async isVendorCodeExist(vendorCode: string): Promise<boolean> {
        const result = await this.dataSource.query(
            'SELECT 1 FROM users WHERE vendorCode = ? LIMIT 1',
            [vendorCode]
        );
        return result.length > 0;
    }

    async updateUser(id: number): Promise<any> {
        const createdBy = id;
        const update = await this.dataSource.query(
            `UPDATE users 
             SET 
                 createdBy = ?, 
                 createdAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [createdBy, id]
        );

        return update;
    }

    async createUser(createUserDTO: CreateUserDTO): Promise<any> {
        const emailExists = await this.isEmailExist(createUserDTO.email);
        if (emailExists) {
            return {
                status: false,
                message: emailIsAlreadyExist,
                data: null
            };
        }
        const mobileExists = await this.isMobileExist(createUserDTO.mobileNo);
        if (mobileExists) {
            return {
                status: false,
                message: mobileNoIsAlreadyExist,
                data: null
            };
        }
        if (createUserDTO.vendorCode) {
            const vendorCodeExists = await this.isVendorCodeExist(createUserDTO.vendorCode);
            if (vendorCodeExists) {
                return {
                    status: false,
                    message: vendorCodeIsAlreadyExist,
                    data: null
                };
            }
        }
        // if( createUserDTO.roleId === 2){

        // }
        const password = createUserDTO.password || this.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const values = [
            createUserDTO.email,
            hashedPassword,
            createUserDTO.mobileNo,
            createUserDTO.roleId,
            createUserDTO.businessName,
            createUserDTO.businessRepresentative,
            createUserDTO.vendorCode,
            createUserDTO.address,
            createUserDTO.status,
        ];

        const query = `INSERT INTO users (email, password, mobileNo, roleId, businessName, businessRepresentative, vendorCode, address, status, createdAt)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now())`;

        try {
            const result = await this.dataSource.query(query, values);
            const userId = result.insertId;
            const updated = await this.updateUser(userId);
            if (!updated) {
                return {
                    status: false,
                    message: theCreateByFieldCannotBeUpdated,
                    data: null
                };
            }
            const createdUser = await this.dataSource.query(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );
            if (createUserDTO.roleId === 2) {
                await this.mailService.sendEmailVendorUserCreated(createUserDTO.email, password, createUserDTO.businessRepresentative);
            } else if (createUserDTO.roleId === 3) {
                await this.mailService.sendWelcomeEmailToNewUserCreated(createUserDTO.email);
            }
            if (createdUser.length > 0) {
                return {
                    status: true,
                    message: userCreatedSuccessfully,
                    data: createdUser[0]
                };
            } else {
                return {
                    status: false,
                    message: anErrorOccurredWhileCreatingTheUser,
                    data: null
                };
            }
        } catch (error) {
            return {
                status: false,
                message: anErrorOccurredWhileCreatingTheUser,
                error: error.message
            };
        }
    }
}
