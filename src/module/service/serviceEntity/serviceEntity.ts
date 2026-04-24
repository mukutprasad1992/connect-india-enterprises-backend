import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum ServiceType {
  INVESTMENT = 'Investment',
  LOAN = 'Loan',
  INSURANCE = 'Insurance',
  POLICY = 'Policy',
}

@Entity({ name: 'services' })
export class ServiceSchema {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @IsEnum(ServiceType)
  @Column({ type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  @IsNumber()
  @Column({ type: 'int' })
  createdBy: number;
}
