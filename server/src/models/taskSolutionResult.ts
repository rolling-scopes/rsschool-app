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
import { CrossCheckCriteriaType } from './taskCriteria';

export interface CrossCheckCriteriaData {
  key: string;
  max?: number;
  text: string;
  type: CrossCheckCriteriaType;
  point?: number;
  comment?: string;
}

export type ScoreRecord = {
  score: number;
  dateTime: number;
  comment: string;
  authorId: number;
  criteria?: CrossCheckCriteriaData[];
};

export interface CrossCheckMessageAuthor {
  id: number;
  githubId: string;
}

export enum CrossCheckMessageAuthorRole {
  Reviewer = 'reviewer',
  Student = 'student',
}

export interface CrossCheckMessage {
  timestamp: string;
  content: string;
  author: CrossCheckMessageAuthor | null;
  role: CrossCheckMessageAuthorRole;
  isReviewerRead: boolean;
  isStudentRead: boolean;
}

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
  messages: CrossCheckMessage[];
}
