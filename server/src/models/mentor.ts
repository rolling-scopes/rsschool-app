import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user';
import { Student } from './student';
import { Course } from './course';
import { TaskChecker } from './taskChecker';
import { StageInterview } from './stageInterview';

@Entity()
@Index(['courseId'])
@Unique(['courseId', 'userId'])
export class Mentor {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne((_) => Course, (course: Course) => course.mentors, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne((_) => User)
  user: User;

  @Column()
  userId: number;

  @Column({ default: false })
  isExpelled: boolean;

  @OneToMany((_) => Student, (student) => student.mentor, { nullable: true })
  students: Student[] | null;

  @OneToMany((_) => TaskChecker, (taskChecker: TaskChecker) => taskChecker.mentor, { nullable: true })
  taskChecker: TaskChecker[] | null;

  @Column({ nullable: true })
  maxStudentsLimit: number;

  @Column({ nullable: true, type: 'varchar' })
  studentsPreference: 'any' | 'city' | 'country';

  @OneToMany((_) => StageInterview, (stageInterview) => stageInterview.mentor, { nullable: true })
  stageInterviews: StageInterview[] | null;
}
