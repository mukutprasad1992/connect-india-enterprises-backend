import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsString, IsEmail, IsOptional, Length, IsEnum } from 'class-validator';

export enum UserStatus {
  Enable = 'Enable',
  Disable = 'Disable',
}
@Entity({ name: 'users' })
export class UserSchema {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @IsOptional()
  @IsEmail()
  @Length(1, 100)
  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @IsOptional()
  @IsString()
  @Column()
  password?: string;

  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  mobileNo?: string;

  @IsOptional()
  @Column({ nullable: true })
  roleId?: string;

  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  accessToken?: string;

  @IsEnum(UserStatus)
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.Enable })
  status: UserStatus;

  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  createdBy?: string;

  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  updatedBy?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Column({ nullable: true })
  businessName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Column()
  businessRepresentative?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Column({ nullable: true })
  vendorCode?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Column()
  address?: string;
}
