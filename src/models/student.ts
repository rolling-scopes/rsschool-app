import {
  Entity,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user';
import { Course } from './course';
import { Mentor } from './mentor';
import { Stage } from './stage';
import { TaskResult } from './taskResult';
import { TaskChecker } from './taskChecker';
@Entity()
export class Student {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Course, (course: Course) => course.students, { nullable: true })
  course: Course | number;

  @ManyToOne(_ => User)
  user: User | number;

  @ManyToOne(_ => Mentor, (mentor: Mentor) => mentor.students, { nullable: true })
  mentor: Mentor;

  @ManyToOne(_ => Stage, (stage: Stage) => stage.students, { nullable: true })
  stage: Stage;

  @OneToMany(_ => TaskResult, (taskResult: TaskResult) => taskResult.student, { nullable: true })
  taskResults: TaskResult[] | null;

  @OneToMany(_ => TaskChecker, (taskChecker: TaskChecker) => taskChecker.student, { nullable: true })
  taskChecker: TaskChecker[] | null;

  @Column({ default: false })
  isExpelled: boolean;

  @Column({ nullable: true })
  expellingReason: string;

  @Column({ default: false })
  courseCompleted: boolean;

  @Column({ default: false })
  isTopPerformer: boolean;

  @Column({ nullable: true })
  preferedMentorGithubId: string;

  @Column({ nullable: true })
  readyFullTime: boolean;

  @Column({ nullable: true })
  cvUrl: string;

  @Column({ nullable: true })
  hiredById: string;

  @Column({ nullable: true })
  hiredByName: string;
}
