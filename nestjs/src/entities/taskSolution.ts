import { Entity, CreateDateColumn, ManyToOne, Column, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Student } from './student';

export interface TaskSolutionComment {
  text: string;
  criteriaId: string;
  timestamp: number;
  authorId: number;
  recipientId?: number;
}

export interface TaskSolutionReview {
  percentage: number;
  criteriaId: string;
}

@Entity()
@Unique(['courseTaskId', 'studentId'])
export class TaskSolution {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  courseTaskId: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @Column()
  url: string;

  @Column({ type: 'json', default: [] })
  review: TaskSolutionReview[];

  @Column({ type: 'json', default: [] })
  comments: TaskSolutionComment[];
}
