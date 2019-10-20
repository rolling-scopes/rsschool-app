import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './user';
import { Student } from './student';
import { Course } from './course';
import { TaskChecker } from './taskChecker';

@Entity()
export class Mentor {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Course, (course: Course) => course.mentors, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne(_ => User)
  user: User;

  @Column()
  userId: number;

  @OneToMany(_ => Student, student => student.mentor, { nullable: true })
  students: Student[] | null;

  @OneToMany(_ => TaskChecker, (taskChecker: TaskChecker) => taskChecker.mentor, { nullable: true })
  taskChecker: TaskChecker[] | null;

  @Column({ nullable: true })
  maxStudentsLimit: number;

  @Column({ nullable: true, type: 'varchar' })
  studentsPreference: 'sameCity' | 'sameCountry' | null;
}
