import { Entity, CreateDateColumn, Column, ManyToOne, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseTask } from './courseTask';

@Entity()
export class TaskInterviewFeedback {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => CourseTask)
  courseTask: CourseTask;

  @Column()
  text: string;
}
