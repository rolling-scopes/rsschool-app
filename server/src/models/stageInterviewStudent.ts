import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { Course } from '.';
import { Student } from './student';

@Entity()
export class StageInterviewStudent {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  @Index({ unique: true })
  studentId: number;

  @ManyToOne(_ => Course)
  course: Course;

  @Column({ nullable: true })
  courseId: number;
}
