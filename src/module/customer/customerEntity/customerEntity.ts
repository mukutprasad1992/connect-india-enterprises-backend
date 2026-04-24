import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  Length,
} from 'class-validator';

@Entity({ name: 'customers' })
export class CustomerSchema {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @IsString()
  @Length(1, 255)
  @Column()
  name: string;

  @IsString()
  @Column()
  address: string;

  @IsOptional()
  @IsString()
  @Length(0, 15)
  @Column({ nullable: true })
  phone?: string;

  @IsEmail()
  @Length(1, 255)
  @Column({ unique: true })
  email: string;

  @IsString()
  @Length(6, 6)
  @Column()
  pincode: string;

  @Column({ type: 'int' })
  vendorId: number;

  @IsOptional()
  @Column({ type: 'int', nullable: true })
  createdBy?: number;

  @IsOptional()
  @IsDateString()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @IsOptional()
  @Column({ type: 'int', nullable: true })
  updatedBy?: number;

  @IsOptional()
  @IsDateString()
  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @IsOptional()
  @Column({ type: 'varchar', length: 255, nullable: true })
  BusinessRepresentative?: string;

  @IsOptional()
  @Column({ type: 'varchar', length: 255, nullable: true })
  businessName?: string;
}
