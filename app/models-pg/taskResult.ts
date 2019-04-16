import {
    Entity,
    JoinColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './student';
import { CourseTask } from './courseTask';

@Entity()
export class TaskResult {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @OneToOne(_ => Student)
    @JoinColumn()
    student: Student;

    @OneToOne(_ => CourseTask)
    @JoinColumn()
    courseTask: CourseTask;

    @Column({ nullable: true })
    githubPrUrl: string;

    @Column({ nullable: true })
    githubRepoUrl: string;

    @Column()
    score: number;

    @Column({ nullable: true })
    comment: string;
}
