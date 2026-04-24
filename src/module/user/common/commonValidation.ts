import {
  firstNameIsRequired,
  lastNameIsRequired,
  emailRegex,
  invalidEmailFormat,
  emailIdRequired,
  userRole,
  passwordIsRequired,
  passwordRegex,
  InvalidPasswordFormat,
  userIdIsRequired,
} from './userMessage';

export class ValidUserDto {
  static validateCreateUserDto(createUserDto) {
    if (!createUserDto.firstName) {
      return {
        statusCode: 400,
        status: false,
        message: firstNameIsRequired,
      };
    }
    if (!createUserDto.lastName) {
      return {
        statusCode: 400,
        status: false,
        message: lastNameIsRequired,
      };
    }
    if (!createUserDto.email) {
      return {
        statusCode: 400,
        status: false,
        message: emailIdRequired,
      };
    }
    if (!emailRegex.test(createUserDto.email)) {
      return {
        statusCode: 400,
        status: false,
        message: invalidEmailFormat,
      };
    }
    if (!createUserDto.password) {
      return {
        statusCode: 400,
        status: false,
        message: passwordIsRequired,
      };
    }
    if (!passwordRegex.test(createUserDto.password)) {
      return {
        statusCode: 400,
        status: false,
        message: InvalidPasswordFormat,
      };
    }
    if (!createUserDto.userRole) {
      return {
        statusCode: 400,
        status: false,
        message: userRole,
      };
    }
    return createUserDto;
  }
}
export class ValidateUserId {
  static isUserId(id) {
    if (!id) {
      return {
        statusCode: 400,
        status: false,
        message: userIdIsRequired,
      };
    }
    return id;
  }
}
