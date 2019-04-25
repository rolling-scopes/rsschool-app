import {
  Entity,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Course } from './course';
import { Student } from './student';
import { CourseTask } from './courseTask';

@Entity()
export class Stage {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @ManyToOne(_ => Course, (course: Course) => course.stages)
  course: Course;

  @OneToMany(_ => Student, student => student.stage, { nullable: true })
  students: Student[] | null;

  @OneToMany(_ => CourseTask, (courseTask: CourseTask) => courseTask.stage, { nullable: true })
  courseTasks: CourseTask[] | null;
}
