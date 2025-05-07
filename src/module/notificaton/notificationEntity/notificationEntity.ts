import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notifications')
export class NotificationSchema {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    message: string;

    @Column()
    userRoleId: number;

    @Column({ nullable: true })
    voucherId: number;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: number;

    @Column({ nullable: true })
    updatedBy: number;

    @Column()
    userId: number;

    @Column()
    vendorId: number;

    @Column()
    isUser: number;


}
