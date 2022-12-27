import {
  Entity,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  Index,
  Unique,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user';
import { Course } from './course';
import { Mentor } from './mentor';
import { Certificate } from './certificate';
import { TaskResult } from './taskResult';
import { TaskChecker } from './taskChecker';
import { TaskInterviewResult } from './taskInterviewResult';
import { StudentFeedback } from './student-feedback';
import { StageInterview } from './stageInterview';
import { TeamDistribution } from './teamDistribution';
import { Team } from './team';

@Entity()
@Unique(['courseId', 'userId'])
export class Student {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Course, (course: Course) => course.students, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  @Index()
  courseId: number;

  @ManyToOne(_ => User)
  user: User;

  @Column()
  @Index()
  userId: number;

  @ManyToOne(_ => Mentor, (mentor: Mentor) => mentor.students, { nullable: true })
  mentor: Mentor | null;

  @Column({ nullable: true })
  @Index()
  mentorId: number | null;

  @OneToMany(_ => TaskResult, (taskResult: TaskResult) => taskResult.student, { nullable: true })
  taskResults: TaskResult[] | null;

  @OneToMany(_ => StageInterview, (stageInterview: StageInterview) => stageInterview.student, { nullable: true })
  stageInterviews: StageInterview[] | null;

  @OneToMany(_ => TaskChecker, (taskChecker: TaskChecker) => taskChecker.student, { nullable: true })
  taskChecker: TaskChecker[] | null;

  @OneToMany(_ => TaskInterviewResult, (taskInterviewResult: TaskInterviewResult) => taskInterviewResult.student, {
    nullable: true,
  })
  taskInterviewResults: TaskInterviewResult[] | null;

  @Column({ default: false })
  @Index()
  isFailed: boolean;

  @Column({ default: false })
  @Index()
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
  repository: string;

  @Column({ nullable: true, type: 'timestamptz' })
  repositoryLastActivityDate: Date;

  @Column({ nullable: true })
  hiredById: string;

  @Column({ nullable: true })
  hiredByName: string;

  @Column({ default: 0, type: 'float' })
  totalScore: number;

  @Column({ default: 0, type: 'float' })
  crossCheckScore: number;

  @Column({ default: 999999 })
  rank: number;

  @Column({ nullable: true, type: 'timestamptz' })
  totalScoreChangeDate: Date;

  @OneToMany(_ => StudentFeedback, (studentFeedback: StudentFeedback) => studentFeedback.student, { nullable: true })
  feedbacks: StudentFeedback[] | null;

  @Column({ default: () => "'1970-01-01 00:00:00+00'", type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @Column({ type: 'text', nullable: true })
  unassigningComment: string;

  @OneToOne(() => Certificate, certificate => certificate.student)
  certificate: Certificate | null;

  @Column({ nullable: true, default: true })
  mentoring: boolean;

  @ManyToMany(() => TeamDistribution, teamDistribution => teamDistribution.students)
  @JoinTable()
  teamDistribution: TeamDistribution[];

  @ManyToMany(() => Team, team => team.students)
  @JoinTable()
  teams: Team[];
}
