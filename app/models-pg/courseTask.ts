import {
    Entity,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course';
import { Task } from './task';

@Entity()
export class CourseTask {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @OneToOne(_ => Task)
    @JoinColumn({ name: 'taskId', referencedColumnName: 'id' })
    taskId: number;

    @OneToOne(_ => Course)
    @JoinColumn({ name: 'courseId', referencedColumnName: 'id' })
    courseId: number;

    @Column({ type: 'timestamp', nullable: true })
    studentStartDate: number;

    @Column({ type: 'timestamp', nullable: true })
    studentEndDate: number;

    @Column({ type: 'timestamp', nullable: true })
    mentorStartDate: number;

    @Column({ type: 'timestamp', nullable: true })
    mentorEndDate: number;
}
