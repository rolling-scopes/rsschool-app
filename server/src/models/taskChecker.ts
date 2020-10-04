import { Entity, CreateDateColumn, ManyToOne, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Mentor } from './mentor';
import { Student } from './student';
import { CourseTask } from './courseTask';

@Entity()
export class TaskChecker {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne((_) => CourseTask)
  courseTask: CourseTask;

  @Column()
  courseTaskId: number;

  @ManyToOne((_) => Student)
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne((_) => Mentor)
  mentor: Mentor;

  @Column()
  mentorId: number;
}
