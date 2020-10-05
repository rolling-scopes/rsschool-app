import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CourseTask } from './courseTask';
import { Student } from './student';

@Entity()
export class TaskArtefact {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: string;

  @Column()
  courseTaskId: number;

  @Column()
  studentId: number;

  @ManyToOne(_ => Student)
  student: Student;

  @ManyToOne(_ => CourseTask)
  courseTask: CourseTask;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  presentationUrl?: string;

  @Column({ nullable: true })
  comment?: string;
}
