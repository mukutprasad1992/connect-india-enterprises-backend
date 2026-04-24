import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Length,
  IsDecimal,
  IsEnum,
} from 'class-validator';
import { CustomerSchema } from '../../customer/customerEntity/customerEntity';
import { UserSchema } from '../../user/userEntity/userSchema';

export enum VoucherStatus {
  Enable = 'Enable',
  Disable = 'Disable',
}
@Entity({ name: 'vouchers' })
export class VoucherSchema {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @IsDecimal()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @IsString()
  @Length(1, 255)
  @Column({ unique: true })
  voucherCode: string;

  @IsDateString()
  @Column({ type: 'date' })
  validityFrom: Date;

  @IsDateString()
  @Column({ type: 'date' })
  validityTo: Date;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Column({ nullable: true })
  vendorCode?: string;

  @IsEnum(VoucherStatus)
  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.Enable })
  status: VoucherStatus;

  @ManyToOne(() => CustomerSchema, { nullable: true, onDelete: 'SET NULL' })
  customer: CustomerSchema;

  @ManyToOne(() => UserSchema, { nullable: true, onDelete: 'SET NULL' })
  vendor: UserSchema;
}
