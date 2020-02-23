import {
  Entity,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Task, TaskType } from './task';
import { Stage } from './stage';
import { TaskChecker } from './taskChecker';
import { TaskResult } from './taskResult';
import { User } from './user';
import { Course } from './course';

@Entity()
export class CourseTask {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(
    _ => Task,
    (task: Task) => task.courseTasks,
  )
  task: Task;

  @Column()
  @Index()
  taskId: number;

  @OneToMany(
    _ => TaskChecker,
    (checker: TaskChecker) => checker.courseTaskId,
    { nullable: true },
  )
  taskCheckers: TaskChecker[] | null;

  @OneToMany(
    _ => TaskResult,
    (taskResult: TaskResult) => taskResult.courseTask,
    { nullable: true },
  )
  taskResults: TaskResult[] | null;

  @ManyToOne(
    _ => Stage,
    (stage: Stage) => stage.courseTasks,
    { nullable: true },
  )
  stage: Stage | number;

  @Column()
  @Index()
  stageId: number;

  @ManyToOne(_ => Course, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  @Index()
  courseId: number;

  @Column({ type: 'timestamptz', nullable: true })
  studentStartDate: string;

  @Column({ type: 'timestamptz', nullable: true })
  studentEndDate: string;

  @Column({ type: 'timestamp', nullable: true })
  mentorStartDate: string;

  @Column({ type: 'timestamp', nullable: true })
  mentorEndDate: string;

  @Column({ nullable: true })
  maxScore: number;

  @Column({ nullable: true, type: 'float', default: 1 })
  scoreWeight: number;

  @Column({ default: 'mentor' })
  @Index()
  checker: 'assigned' | 'mentor' | 'taskOwner' | 'crossCheck' | 'jury';

  @ManyToOne(_ => User, { nullable: true })
  taskOwner: User | null;

  @Column({ nullable: true })
  @Index()
  taskOwnerId: number | null;

  @Column({ nullable: true, type: 'int' })
  pairsCount: number | null;

  @Column({ nullable: true, type: 'varchar' })
  type: TaskType;
}
