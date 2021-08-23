import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { InterviewQuestion } from './interviewQuestion';

@Entity()
export class InterviewQuestionCategory {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column({
    unique: true,
  })
  name: string;

  @ManyToMany(_ => InterviewQuestion, question => question.categories)
  questions: InterviewQuestion[];
}
