import { Entity, CreateDateColumn, OneToMany, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseTask } from './courseTask';
import { Mentor } from './mentor';

@Entity()
export class Checker {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @OneToMany(_ => CourseTask, (courseTask: CourseTask) => courseTask.checker, { nullable: true })
    assignedTasks: CourseTask[] | null;

    @OneToMany(_ => Mentor, (mentor: Mentor) => mentor.checker)
    mentors: Mentor[];
}
