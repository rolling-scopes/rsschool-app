<<<<<<< HEAD
import { Entity, CreateDateColumn, ManyToOne, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Mentor } from './mentor';
import { Student } from './student';
@Entity()
export class TaskChecker {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  courseTaskId: number;

  @ManyToOne(_ => Student)
  student: Student | number;

  @ManyToOne(_ => Mentor)
  mentor: Mentor | number;
=======
import { Entity, CreateDateColumn, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TaskChecker {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @Column()
    courseTaskId: number;

    @Column()
    studentId: number;

    @Column()
    mentorId: number;
>>>>>>> feat: update task checker
}
