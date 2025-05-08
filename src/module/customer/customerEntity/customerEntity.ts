import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsString, IsEmail, IsOptional, IsDateString, Length } from 'class-validator';

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

}
