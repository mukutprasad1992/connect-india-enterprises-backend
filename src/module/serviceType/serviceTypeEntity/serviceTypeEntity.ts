import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum status {
    inActive = 'inActive',
    active = 'active',
}
export enum ServiceTypeStatus {
    PENDING = 'Pending',
    ACTIVE = 'In Progress',
    COMPLETED = 'Approved',
    CANCELED = 'Rejected',
}

@Entity({ name: 'investmentdetails' })
export class ServiceTypeSchema {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column()
    serviceRequestId: number;

    @Column()
    basicDetailsId: number;

    @Column()
    personalDetailsId: number;

    @Column()
    nomineeDetailsId: number;

    @Column()
    documentsId: number;

    @Column({
        type: 'enum',
        enum: status,
        default: status.active,
    })
    status: ServiceTypeStatus;

    @Column()
    activeSteps: string;

    @Column()
    submit: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @Column()
    createdBy: number;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column()
    updatedBy: number;

    @Column()
    email: string

    @Column()
    mobile: string

    @Column()
    placeOfBirth: JSON

    @Column()
    serviceId: number

    @Column()
    ServiceSubType: string

}