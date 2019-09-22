import { Entity, CreateDateColumn, ManyToOne, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './student';
import { CourseTask } from './courseTask';

@Entity()
export class TaskVerification {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(_ => CourseTask)
  courseTask: Student;

  @Column()
  courseTaskId: number;

  @Column({ nullable: true })
  details: string;

  @Column()
  status: 'success' | 'error';

  @Column()
  score: number;

  @Column({ type: 'json', default: [] })
  metadata: { path: string; md5: string }[];
}
