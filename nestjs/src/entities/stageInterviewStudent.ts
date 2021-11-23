import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Course } from '.';
import { Student } from './student';

@Entity()
@Unique(['studentId', 'courseId'])
export class StageInterviewStudent {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(_ => Course)
  course: Course;

  @Column({ nullable: true })
  courseId: number;
}
