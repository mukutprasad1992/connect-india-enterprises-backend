import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { IsString, IsDateString, IsEnum } from 'class-validator';

export enum ServiceSubType {
  Stocks = 'Stocks',
  Bonds = 'Bonds',
  RealEstate = 'Real Estate',
  MutualFunds = 'Mutual Funds',
  Debt = 'Debt',
  FixedDeposits = 'Fixed Deposits',
  NationalPensionScheme = 'National Pension Scheme (NPS)',
  PublicProvidentFund = 'Public Provident Fund (PPF)',
  LifeInsurancePolicies = 'Life insurance policies',
  HealthInsurancePolicies = 'Health insurance policies',
  TravelInsurancePolicies = 'Travel insurance policies',
  CriticalIllnessInsurance = 'Critical illness insurance',
  PropertyInsurancePolicies = 'Property insurance policies',
  RetirementPolicies = 'Retirement policies',
  LifeInsurance = 'Life insurance',
  HealthInsurance = 'Health insurance',
  BusinessInsurance = 'Business insurance',
  HomeInsurance = 'Home insurance',
  TermLifeInsurance = 'Term life insurance',
  MotorInsurance = 'Motor insurance',
  GeneralInsurance = 'General insurance',
  FireInsurance = 'Fire insurance',
  PersonalLoans = 'Personal loans',
  HomeLoans = 'Home loans',
  BusinessLoans = 'Business loans',
  CarLoans = 'Car loans',
  EducationLoans = 'Education loans',
  GoldLoans = 'Gold loans',
}

@Entity({ name: 'serviceSubTypes' })
export class ServiceSubTypeSchema {
  @PrimaryGeneratedColumn({ type: 'int' })
  ledgerId: number;

  @IsEnum(ServiceSubType)
  @Column({
    type: 'enum',
    enum: ServiceSubType,
    nullable: false,
  })
  ledgerType: ServiceSubType;

  @Column()
  serviceId: number;

  @IsDateString()
  @CreateDateColumn()
  createdAt: Date;
}
