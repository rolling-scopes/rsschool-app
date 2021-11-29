import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user';
import { Mentor } from './mentor';
import { Student } from './student';

export enum LanguageLevel {
  A1 = 'a1',
  A2 = 'a2',
  B1 = 'b1',
  B2 = 'b2',
  C1 = 'c1',
  C2 = 'c2',
}

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
