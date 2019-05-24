<<<<<<< HEAD
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

=======
import { Entity, CreateDateColumn, ManyToOne, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Mentor } from './mentor';
import { Student } from './student';
>>>>>>> feat: add task checker
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
    student: Student;

<<<<<<< HEAD
    @Column()
    mentorId: number;
>>>>>>> feat: update task checker
=======
    @ManyToOne(_ => Mentor)
    mentor: Mentor;
>>>>>>> feat: add task checker
}
