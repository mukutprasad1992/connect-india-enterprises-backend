import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';



@Injectable()
export class CreateProfileDto {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    currentStreet: string;
    currentArea: string;
    currentCity: string;
    currentState: string;
    currentCountry: string;
    currentPinCode: string;
    permanentStreet: string;
    permanentArea: string;
    permanentCity: string;
    permanentState: string;
    permanentCountry: string;
    permanentPinCode: string;
    mobileNo: string;
    createdBy: string;

    static profileSchema = Joi.object({
        firstName: Joi.string().min(1).max(100).required(),
        lastName: Joi.string().min(1).max(100).required(),
        email: Joi.string().email(),
        dateOfBirth: Joi.string().isoDate().required(),
        currentStreet: Joi.string().min(1).max(100),
        currentArea: Joi.string().min(1).max(100),
        currentCity: Joi.string().min(1).max(100),
        currentState: Joi.string().min(1).max(100),
        currentCountry: Joi.string().min(1).max(100),
        currentPinCode: Joi.string().min(1).max(100),
        permanentStreet: Joi.string().min(1).max(100),
        permanentArea: Joi.string().min(1).max(100),
        permanentCity: Joi.string().min(1).max(100),
        permanentState: Joi.string().min(1).max(100),
        permanentCountry: Joi.string().min(1).max(100),
        permanentPinCode: Joi.string().min(1).max(100),
        createdBy: Joi.string().min(1).max(100),
        mobileNo: Joi.string().trim().pattern(/^[0-9]{10,15}$/),
    });
}
