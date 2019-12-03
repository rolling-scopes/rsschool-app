import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  Column,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
  Unique,
} from 'typeorm';
import { Student } from './student';

@Entity()
@Index(['courseTaskId', 'studentId'])
@Unique(['courseTaskId', 'studentId'])
export class TaskSolution {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  courseTaskId: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @Column()
  url: string;
}
