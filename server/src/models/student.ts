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
import { TaskInterviewResult } from './taskInterviewResult';
import { StudentFeedback } from './studentFeedback';

@Entity()
export class Student {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Course, (course: Course) => course.students, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne(_ => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(_ => Mentor, (mentor: Mentor) => mentor.students, { nullable: true })
  mentor: Mentor;

  @Column({ nullable: true })
  mentorId: number;

  @ManyToOne(_ => Stage, (stage: Stage) => stage.students, { nullable: true })
  stage: Stage;

  @OneToMany(_ => TaskResult, (taskResult: TaskResult) => taskResult.student, { nullable: true })
  taskResults: TaskResult[] | null;

  @OneToMany(_ => TaskChecker, (taskChecker: TaskChecker) => taskChecker.student, { nullable: true })
  taskChecker: TaskChecker[] | null;

  @OneToMany(_ => TaskInterviewResult, (taskInterviewResult: TaskInterviewResult) => taskInterviewResult.student, {
    nullable: true,
  })
  taskInterviewResults: TaskInterviewResult[] | null;

  @Column({ default: false })
  isFailed: boolean;

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

  @Column({ default: 0, type: 'float' })
  totalScore: number;

  @OneToMany(_ => StudentFeedback, (studentFeedback: StudentFeedback) => studentFeedback.student, { nullable: true })
  feedback: StudentFeedback[] | null;

  @Column({ default: new Date(0), type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  certificateUrl: string;
}
