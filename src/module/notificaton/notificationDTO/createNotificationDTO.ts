import * as Joi from 'joi';

export class CreateNotificationDTO {
  message: string;
  userRoleId: number;
  voucherId?: number;
  isRead?: boolean;
  createdBy?: number;
  updatedBy?: number;
  userId: number;
  vendorId: number;
  isUser: number;

  static notificationSchema = Joi.object({
    message: Joi.string().min(1).max(1000).required(),
    userRoleId: Joi.number().valid(1, 2).optional(),
    voucherId: Joi.number().positive().optional(),
    isRead: Joi.boolean().optional(),
    createdBy: Joi.number().positive().optional(),
    updatedBy: Joi.number().positive().optional(),
    userId: Joi.number().positive().required(),
    vendorId: Joi.number().positive().optional(),
    isUser: Joi.number().positive().optional(),
  });

  static validate(notification: CreateNotificationDTO) {
    const { error } =
      CreateNotificationDTO.notificationSchema.validate(notification);
    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
