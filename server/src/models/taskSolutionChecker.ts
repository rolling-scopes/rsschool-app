import { Entity, CreateDateColumn, ManyToOne, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
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
  courseTaskId: number;

  @ManyToOne(_ => TaskSolution)
  taskSolution: TaskSolution;

  @Column()
  taskSolutionId: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(_ => Student)
  checker: Student;

  @Column()
  checkerId: number;
}
