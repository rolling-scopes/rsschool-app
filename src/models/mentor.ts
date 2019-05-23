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
<<<<<<< HEAD
<<<<<<< HEAD
import { TaskChecker } from './taskChecker';
=======
import { Checker } from './checker';
>>>>>>> feat: update checker
=======
>>>>>>> feat: shuffle checkers

@Entity()
export class Mentor {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Course, (course: Course) => course.mentors, { nullable: true })
  course: Course | number;

  @ManyToOne(_ => User)
  user: User | number;

  @OneToMany(_ => Student, student => student.mentor, { nullable: true })
  students: Student[] | null;

  @OneToMany(_ => TaskChecker, (taskChecker: TaskChecker) => taskChecker.mentor, { nullable: true })
  taskChecker: TaskChecker[] | null;

  @Column({ nullable: true })
  maxStudentsLimit: number;
}
