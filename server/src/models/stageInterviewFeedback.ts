import {
  Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { StageInterview } from './stageInterview';

@Entity()
export class StageInterviewFeedback {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => StageInterview)
  stageInterview: StageInterview;

  @Column()
  stageInterviewId: number;

  @Column()
  json: string;
}
