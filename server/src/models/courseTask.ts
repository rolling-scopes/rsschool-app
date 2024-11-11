import {
  Entity,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Task, TaskType } from './task';
import { TaskChecker } from './taskChecker';
import { TaskResult } from './taskResult';
import { User } from './user';
import { Course } from './course';
import { TaskSolution } from './taskSolution';
import { TeamDistribution } from './teamDistribution';

export enum Checker {
  AutoTest = 'auto-test',
  Assigned = 'assigned',
  Mentor = 'mentor',
  TaskOwner = 'taskOwner',
  CrossCheck = 'crossCheck',
}

export enum CrossCheckStatus {
  Initial = 'initial',
  Distributed = 'distributed',
  Completed = 'completed',
}

export enum CourseTaskValidation {
  githubIdInUrl = 'githubIdInUrl',
  githubPrInUrl = 'githubPrInUrl',
}

@Entity()
export class CourseTask {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: string;

  @ManyToOne(_ => Task, (task: Task) => task.courseTasks)
  task: Task;

  @Column()
  @Index()
  taskId: number;

  @OneToMany(_ => TaskChecker, (checker: TaskChecker) => checker.courseTaskId, { nullable: true })
  taskCheckers: TaskChecker[] | null;

  @OneToMany(_ => TaskResult, (taskResult: TaskResult) => taskResult.courseTask, { nullable: true })
  taskResults: TaskResult[] | null;

  @OneToMany(_ => TaskSolution, (taskSolution: TaskSolution) => taskSolution.courseTask, { nullable: true })
  taskSolutions: TaskSolution[] | null;

  @ManyToOne(_ => Course, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  @Index()
  courseId: number;

  @Column({ type: 'timestamptz', nullable: true })
  studentStartDate: null | Date | string;

  @Column({ type: 'timestamptz', nullable: true })
  studentEndDate: null | Date | string;

  @Column({ type: 'timestamptz', nullable: true })
  crossCheckEndDate: null | Date | string;

  @Column({ type: 'timestamp', nullable: true })
  mentorStartDate: null | Date | string;

  @Column({ type: 'timestamp', nullable: true })
  mentorEndDate: null | Date | string;

  @Column({ nullable: true })
  maxScore: number;

  @Column({ nullable: true, type: 'float', default: 1 })
  scoreWeight: number;

  @Column({ default: 'mentor' })
  @Index()
  checker: Checker;

  @ManyToOne(_ => User, { nullable: true })
  taskOwner: User | null;

  @Column({ nullable: true })
  @Index()
  @JoinColumn({ name: 'taskOwnerId' })
  taskOwnerId: number | null;

  @Column({ nullable: true, type: 'int' })
  pairsCount: number | null;

  @Column({ nullable: true, type: 'varchar' })
  type: TaskType;

  @Column({ default: false, type: 'boolean' })
  @Index()
  disabled: boolean;

  @Column({ type: 'enum', enum: CrossCheckStatus, default: CrossCheckStatus.Initial })
  crossCheckStatus: CrossCheckStatus;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  submitText: string | null;

  @Column({ type: 'simple-json', nullable: true })
  validations: Record<CourseTaskValidation, boolean> | null;

  @ManyToOne(() => TeamDistribution, teamDistribution => teamDistribution.courseTasks)
  @JoinColumn()
  teamDistribution: TeamDistribution;
}
