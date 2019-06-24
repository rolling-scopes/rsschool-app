import { Entity, CreateDateColumn, Column, ManyToOne, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './student';

@Entity()
export class StudentFeedback {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Student)
  student: Student | number;

  @Column()
  text: string;
}
