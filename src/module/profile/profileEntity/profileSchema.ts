import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    IsInt,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

@Entity({ name: 'users' })
export class UserSchema {
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @Length(1, 15)
    @Column({ type: 'varchar', length: 15 })
    mobileNo: string;

    @IsOptional()
    @IsInt()
    @Column({ type: 'int', nullable: true })
    createdBy: number;

    @IsOptional()
    @IsInt()
    @Column({ type: 'int', nullable: true })
    updatedBy: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @IsOptional()
    @IsString()
    @Length(1, 255)
    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @IsOptional()
    @IsInt()
    @Column({ type: 'int', nullable: true })
    pinCode: number;


    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @IsOptional()
    @IsString()
    @Length(1, 100)
    @Column({ type: 'varchar', length: 100, nullable: true })
    profileImageURL: string;
}
