import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from '../userDTO/createUserDTO';
import { UserSchema } from '../userEntity/userSchema';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../../../utils/mailer/authMailer';
import { AppLogger } from 'src/utils/common/loggerService';
import {
  userCreatedSuccessfully,
  anErrorOccurredWhileCreatingTheUser,
  emailIsAlreadyExist,
  mobileNoIsAlreadyExist,
  theCreateByFieldCannotBeUpdated,
  vendorCodeIsAlreadyExist,
  emailCheckFor,
  mobileNumberCheckFor,
  vendorCodeCheckFor,
  updatedCreatedByForUserID,
  startingUserCreationForEmail,
  emailAlreadyExists,
  mobileNumberAlreadyExists,
  vendorCodeAlreadyExists,
  generatedPasswordForUser,
  failedToUpdateCreatedByForUserID,
  sentVendorEmailForUserID,
  sentWelcomeEmailForUserID,
  userCreatedSuccessfullyID,
  errorDuringUserCreation,
} from '../common/userMessage';

@Injectable()
export class UserCreateService {
  constructor(
    @InjectRepository(UserSchema)
    private userRepository: Repository<UserSchema>,
    private dataSource: DataSource,
    private mailService: MailService,
    private logger: AppLogger,
  ) {}
  private generateRandomPassword(length: number = 10): string {
    if (length < 8) {
      length = 8;
    }

    const upperCaseCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseCharacters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialCharacters = '!@#$%^&*()_-+=<>?';
    const firstChar =
      upperCaseCharacters[
        Math.floor(Math.random() * upperCaseCharacters.length)
      ];

    const lowerChar =
      lowerCaseCharacters[
        Math.floor(Math.random() * lowerCaseCharacters.length)
      ];
    const numberChar = numbers[Math.floor(Math.random() * numbers.length)];
    const specialChar =
      specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

    const allCharacters =
      upperCaseCharacters + lowerCaseCharacters + numbers + specialCharacters;

    const remainingLength = length - 4;

    const remainingChars: string[] = [];
    for (let i = 0; i < remainingLength; i++) {
      remainingChars.push(
        allCharacters[Math.floor(Math.random() * allCharacters.length)],
      );
    }

    const shuffled = [
      firstChar,
      lowerChar,
      numberChar,
      specialChar,
      ...remainingChars,
    ].sort(() => Math.random() - 0.5);

    return shuffled.join('');
  }

  async isEmailExist(email: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    this.logger.doLog(
      `${emailCheckFor} ${email} — exists: ${result.length > 0}`,
      'info',
    );
    return result.length > 0;
  }

  async isMobileExist(mobileNo: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM users WHERE mobileNo = ? LIMIT 1',
      [mobileNo],
    );
    this.logger.doLog(
      `${mobileNumberCheckFor} ${mobileNo} — exists: ${result.length > 0}`,
      'info',
    );
    return result.length > 0;
  }

  async isVendorCodeExist(vendorCode: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM users WHERE vendorCode = ? LIMIT 1',
      [vendorCode],
    );
    this.logger.doLog(
      `${vendorCodeCheckFor} ${vendorCode} — exists: ${result.length > 0}`,
      'info',
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
      [createdBy, id],
    );
    this.logger.doLog(`${updatedCreatedByForUserID} ${id}`, 'info');
    return update;
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<any> {
    this.logger.doLog(
      `${startingUserCreationForEmail} ${createUserDTO.email}`,
      'info',
    );
    const emailExists = await this.isEmailExist(createUserDTO.email);

    if (emailExists) {
      this.logger.doLog(`${emailAlreadyExists} ${createUserDTO.email}`, 'warn');
      return {
        status: false,
        message: emailIsAlreadyExist,
        data: null,
      };
    }

    const mobileExists = await this.isMobileExist(createUserDTO.mobileNo);
    if (mobileExists) {
      this.logger.doLog(
        `${mobileNumberAlreadyExists} ${createUserDTO.mobileNo}`,
        'warn',
      );
      return {
        status: false,
        message: mobileNoIsAlreadyExist,
        data: null,
      };
    }
    if (createUserDTO.vendorCode) {
      const vendorCodeExists = await this.isVendorCodeExist(
        createUserDTO.vendorCode,
      );
      if (vendorCodeExists) {
        this.logger.doLog(
          `${vendorCodeAlreadyExists} ${createUserDTO.vendorCode}`,
          'warn',
        );
        return {
          status: false,
          message: vendorCodeIsAlreadyExist,
          data: null,
        };
      }
    }
    // if( createUserDTO.roleId === 2){

<<<<<<< HEAD
    // }
    const password = createUserDTO.password || this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.doLog(
      `${generatedPasswordForUser} ${createUserDTO.email}`,
      'info',
    );
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
=======
        if (emailExists) {
            this.logger.doLog(`${emailAlreadyExists} ${createUserDTO.email}`, 'warn');
            return {
                status: false,
                message: emailIsAlreadyExist,
                data: null
            };
        }

        const mobileExists = await this.isMobileExist(createUserDTO.mobileNo);
        if (mobileExists) {
            this.logger.doLog(`${mobileNumberAlreadyExists} ${createUserDTO.mobileNo}`, 'warn');
            return {
                status: false,
                message: mobileNoIsAlreadyExist,
                data: null
            };
        }
        if (createUserDTO.vendorCode) {
            const vendorCodeExists = await this.isVendorCodeExist(createUserDTO.vendorCode);
            if (vendorCodeExists) {
                this.logger.doLog(`${vendorCodeAlreadyExists} ${createUserDTO.vendorCode}`, 'warn');
                return {
                    status: false,
                    message: vendorCodeIsAlreadyExist,
                    data: null
                };
            }
        }
        // if( createUserDTO.roleId === 2){
>>>>>>> 89bba0fa105cf3f3a469624ee08f65cc90e0eb21

    const query = `INSERT INTO users (email, password, mobileNo, roleId, businessName, businessRepresentative, vendorCode, address, status, createdAt)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now())`;

    try {
      const result = await this.dataSource.query(query, values);
      const userId = result.insertId;
      const updated = await this.updateUser(userId);
      if (!updated) {
        this.logger.doLog(
          `${failedToUpdateCreatedByForUserID} ${userId}`,
          'error',
        );
        return {
          status: false,
          message: theCreateByFieldCannotBeUpdated,
          data: null,
        };
      }
      const createdUser = await this.dataSource.query(
        'SELECT * FROM users WHERE id = ?',
        [userId],
      );
      if (createUserDTO.roleId === 2) {
        await this.mailService.sendEmailVendorUserCreated(
          createUserDTO.email,
          password,
          createUserDTO.businessRepresentative,
        );
        this.logger.doLog(`${sentVendorEmailForUserID} ${userId}`, 'info');
      } else if (createUserDTO.roleId === 3) {
        await this.mailService.sendWelcomeEmailToNewUserCreated(
          createUserDTO.email,
        );
        this.logger.doLog(`${sentWelcomeEmailForUserID} ${userId}`, 'info');
      }
      if (createdUser.length > 0) {
        this.logger.doLog(`${userCreatedSuccessfullyID} ${userId}`, 'success');
        return {
          status: true,
          message: userCreatedSuccessfully,
          data: createdUser[0],
        };
      } else {
        this.logger.doLog(`${userCreatedSuccessfullyID} ${userId}`, 'error');
        return {
          status: false,
          message: anErrorOccurredWhileCreatingTheUser,
          data: null,
        };
      }
    } catch (error: any) {
      this.logger.doLog(`${errorDuringUserCreation} ${error.message}`, 'error');
      return {
        status: false,
        message: anErrorOccurredWhileCreatingTheUser,
        error: error.message,
      };
    }
  }
}
