import { Entity, CreateDateColumn, ManyToOne, Column, UpdateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Student } from './student';
import { TaskSolution } from '.';

@Entity()
export class TaskSolutionChecker {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  @Index()
  courseTaskId: number;

  @ManyToOne(_ => TaskSolution)
  taskSolution: TaskSolution;

  @Column()
  @Index()
  taskSolutionId: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(_ => Student)
  checker: Student;

  @Column()
  @Index()
  checkerId: number;
}
