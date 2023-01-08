import { Entity, CreateDateColumn, ManyToOne, Column, UpdateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Student } from './student';
import { CourseTask } from './courseTask';

export interface SelfEducationQuestion {
  question: string;
  answers: string[];
  multiple: boolean;
  questionImage?: string;
  answersType?: 'image';
}

@Entity()
export class TaskVerification {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  @Index()
  updatedDate: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  @Index()
  studentId: number;

  @ManyToOne(_ => CourseTask)
  courseTask: CourseTask;

  @Column()
  @Index()
  courseTaskId: number;

  @Column({ nullable: true })
  details: string;

  @Column({ default: 'pending' })
  status: 'completed' | 'error' | 'pending' | 'cancelled';

  @Column()
  score: number;

  @Column({ type: 'json', default: [] })
  metadata: { path: string; md5: string }[];

  @Column({ type: 'json', default: [] })
  answers: {
    index: number;
    value: (number | number[])[];
    isCorrect: boolean;
  }[];
}
