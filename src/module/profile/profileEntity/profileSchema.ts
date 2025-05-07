import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsString, IsEmail, IsOptional, IsDateString, Length } from 'class-validator';

@Entity({ name: 'profiles' })
export class ProfileSchema {
    @PrimaryGeneratedColumn({ type: 'int' })
    profileId: number;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @IsEmail()
    @Length(1, 100)
    @Column({ unique: true })
    email: string;

    @IsDateString()
    @Column({ type: 'varchar', length: 100 })
    dateOfBirth: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    currentStreet: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    currentArea: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    currentCity: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    currentState: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    currentCountry: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    currentPinCode: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    permanentStreet: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    permanentArea: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    permanentCity: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    permanentState: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    permanentCountry: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    permanentPinCode: string;

    @IsString()
    @Length(1, 15)
    @Column({ type: 'varchar', length: 15 })
    mobileNo: string;

    @Column({ type: 'varchar', length: 100 })
    createdBy: string;

    @Column({ type: 'varchar', length: 100 })
    updatedBy: string;
}
