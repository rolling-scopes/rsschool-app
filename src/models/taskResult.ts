import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from './student';
import { CourseTask } from './courseTask';

@Entity()
export class TaskResult {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Student)
  student: Student | number;

  @ManyToOne(_ => CourseTask)
  courseTask: CourseTask | number;

  @Column({ nullable: true })
  githubPrUrl: string;

  @Column({ nullable: true })
  githubRepoUrl: string;

  @Column()
  score: number;

  @Column({ nullable: true })
  comment: string;
}
