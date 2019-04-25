import { Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseTask } from './courseTask';

@Entity()
export class Task {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  descriptionUrl: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(_ => CourseTask, (courseTask: CourseTask) => courseTask.task, { nullable: true })
  courseTasks: CourseTask[] | null;

  @Column()
  verification: 'auto' | 'manual';
}
