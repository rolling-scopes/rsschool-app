import { LanguageLevel } from 'src/data';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Mentor } from './mentor';
import { Student } from './student';

export interface StudentFeedbackContent {
  impression: string;
  gaps: string;
  recommendationComment: string;
}

export enum Recommendation {
  Hire = 'hire',
  NotHire = 'notHire',
}

@Entity()
@Unique(['studentId', 'mentorId'])
export class StudentFeedback {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;

  @CreateDateColumn({ name: 'created_date' })
  public createdDate: number;

  @UpdateDateColumn({ name: 'updated_date' })
  public updatedDate: number;

  @ManyToOne(_ => Student)
  @JoinColumn({ name: 'student_id' })
  public student: Student | number;

  @Column({ name: 'student_id' })
  public studentId: number;

  @ManyToOne(_ => Mentor)
  @JoinColumn({ name: 'mentor_id' })
  public mentor: Mentor | number;

  @Column({ name: 'mentor_id' })
  public mentorId: number;

  @Column({ name: 'content', type: 'json' })
  public content?: StudentFeedbackContent;

  @Column({ name: 'recommendation', type: 'varchar', length: 64 })
  public recommendation?: Recommendation;

  @Column({ name: 'english_level', type: 'varchar', length: 8 })
  public englishLevel: LanguageLevel;

  @Column({ name: 'author_id' })
  public auhtorId: number;
}
