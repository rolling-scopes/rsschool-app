import { LanguageLevel } from '../data';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user';
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
export class StudentFeedback {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;

  @CreateDateColumn({ name: 'created_date' })
  public createdDate: string;

  @UpdateDateColumn({ name: 'updated_date' })
  public updatedDate: string;

  @DeleteDateColumn({ name: 'deleted_date' })
  public deletedDate: string;

  @ManyToOne(_ => Student)
  @JoinColumn({ name: 'student_id' })
  public student: Student;

  @Column({ name: 'student_id' })
  @Index()
  public studentId: number;

  @ManyToOne(_ => Mentor, { nullable: true })
  @JoinColumn({ name: 'mentor_id' })
  public mentor: Mentor;

  @Column({ name: 'mentor_id', nullable: true })
  @Index()
  public mentorId: number;

  @Column({ name: 'content', type: 'json' })
  public content?: StudentFeedbackContent;

  @Column({ name: 'recommendation', type: 'varchar', length: 64 })
  public recommendation?: Recommendation;

  @Column({ name: 'english_level', type: 'varchar', length: 8 })
  public englishLevel: LanguageLevel;

  @Column({ name: 'author_id' })
  public auhtorId: number;

  @ManyToOne(_ => User)
  @JoinColumn({ name: 'author_id' })
  public author: User;
}
