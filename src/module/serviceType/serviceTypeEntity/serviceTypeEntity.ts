import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min } from 'class-validator';
import { UserSchema } from '../../user/userEntity/userSchema';

export enum ServiceTypeStatus {
    PENDING = 'Pending',
    ACTIVE = 'In Progress',
    COMPLETED = 'Approved',
    CANCELED = 'Rejected',
}

@Entity({ name: 'servicetypes' })
export class ServiceTypeSchema {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @IsNumber()
    @Min(0)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @IsString()
    @Column()
    serviceSubType: string;

    @IsDateString()
    @CreateDateColumn()
    createdAt: Date;

    @IsDateString()
    @Column()
    duration: string;

    @IsEnum(ServiceTypeStatus)
    @Column({ type: 'enum', enum: ServiceTypeStatus, default: ServiceTypeStatus.PENDING })
    status: ServiceTypeStatus;

    @Column()
    comment: string;

    @IsNumber()
    @Min(0)
    @Column({ type: 'decimal', precision: 10, })
    serviceId: number;

    @Column({ type: 'time', nullable: true })
    fromTime: string;

    @Column({ type: 'time', nullable: true })
    toTime: string;

    @Column()
    createdBy: string;

    @ManyToOne(() => UserSchema, (user) => user.id, { onDelete: 'CASCADE' })
    user: UserSchema;
}
