import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { InterviewQuestionCategory } from './interviewQuestionCategory';

@Entity()
export class InterviewQuestion {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column({
    unique: true,
  })
  title: string;

  @Column()
  question: string;

  @ManyToMany(_ => InterviewQuestionCategory, category => category.questions)
  @JoinTable()
  categories: InterviewQuestionCategory[];
}
