import { Entity, CreateDateColumn, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Checker {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @Column()
    courseTaskId: number;

    @Column()
    studentId: number;

    @Column()
    mentorId: number;
}
