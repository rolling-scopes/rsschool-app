import { Entity, ManyToOne, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task';
import { Stage } from './stage';

@Entity()
export class CourseTask {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Task, (task: Task) => task.courseTasks)
  task: Task | number;

  @ManyToOne(_ => Stage, (stage: Stage) => stage.courseTasks, { nullable: true })
  stage: Stage | number;

  @Column({ type: 'timestamp', nullable: true })
  studentStartDate: number;

  @Column({ type: 'timestamp', nullable: true })
  studentEndDate: number;

  @Column({ type: 'timestamp', nullable: true })
  mentorStartDate: number;

  @Column({ type: 'timestamp', nullable: true })
  mentorEndDate: number;
}
