import {
  Column,
  Unique,
  Index,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student';
import { CourseTask } from './courseTask';
import { TaskSolutionReview } from './taskSolution';

type ScoreRecord = {
  score: number;
  dateTime: number;
  comment: string;
  authorId: number;
};

export enum TaskSolutionResultRole {
  Student = 'student',
  Checker = 'checker',
}

export type TaskSolutionResultMessage = {
  timestamp: string;
  content: string;
  author: {
    id: number;
    githubId: string;
  } | null;
  role: TaskSolutionResultRole;
  isCheckerRead: boolean;
  isStudentRead: boolean;
};

@Entity()
@Unique(['courseTaskId', 'studentId', 'checkerId'])
export class TaskSolutionResult {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: string;

  @ManyToOne(_ => CourseTask)
  courseTask: CourseTask;

  @Column()
  @Index()
  courseTaskId: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  @Index()
  studentId: number;

  @ManyToOne(_ => Student)
  checker: Student;

  @Column()
  @Index()
  checkerId: number;

  @Column()
  score: number;

  @Column({ type: 'json', default: [] })
  historicalScores: ScoreRecord[] = [];

  @Column({ nullable: true })
  comment?: string;

  @Column({ default: true, type: 'boolean' })
  anonymous: boolean;

  @Column({ type: 'json', default: [] })
  review: TaskSolutionReview[];

  @Column({ type: 'json', default: [] })
  messages: TaskSolutionResultMessage[];
}
