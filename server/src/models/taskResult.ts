import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from './student';
import { CourseTask } from './courseTask';

type ScoreRecord = {
  score: number;
  dateTime: number;
  comment: string;
  authorId: number;
};

@Entity()
export class TaskResult {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: string;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @Column()
  courseTaskId: number;

  @ManyToOne(_ => CourseTask)
  courseTask: CourseTask | number;

  @Column({ nullable: true })
  githubPrUrl: string;

  @Column({ nullable: true })
  githubRepoUrl: string;

  @Column()
  score: number;

  @Column({ type: 'json', default: [] })
  historicalScores: ScoreRecord[] = [];

  @Column({ type: 'json', default: [] })
  juryScores: ScoreRecord[] = [];

  @Column({ nullable: true })
  comment?: string;
}
