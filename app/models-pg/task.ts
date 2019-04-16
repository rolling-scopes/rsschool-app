import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    descriptionUrl: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    verification: 'auto' | 'manual';
}
