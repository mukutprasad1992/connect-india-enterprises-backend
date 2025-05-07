import * as Joi from 'joi';

export class UpdateProfileDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    mobileNo: string;
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
    updatedBy: string;

    static profileSchema = Joi.object({
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        dateOfBirth: Joi.string().optional(),
        mobileNo: Joi.string().optional(),
        currentStreet: Joi.string().optional(),
        currentArea: Joi.string().optional(),
        currentCity: Joi.string().optional(),
        currentState: Joi.string().optional(),
        currentCountry: Joi.string().optional(),
        currentPinCode: Joi.string().optional(),
        permanentStreet: Joi.string().optional(),
        permanentArea: Joi.string().optional(),
        permanentCity: Joi.string().optional(),
        permanentState: Joi.string().optional(),
        permanentCountry: Joi.string().optional(),
        permanentPinCode: Joi.string().optional(),
        updatedBy: Joi.string().optional(),
    });
}
