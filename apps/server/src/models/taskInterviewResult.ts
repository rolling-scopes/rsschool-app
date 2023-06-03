import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { CourseTask } from './courseTask';
import { Student } from './student';
import { Mentor } from './mentor';

interface FormRecords {
  questionId: string;
  questionText: string;
  answer: string;
}

@Entity()
export class TaskInterviewResult {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: string;

  @Column()
  @Index()
  courseTaskId: number;

  @Column()
  @Index()
  studentId: number;

  @ManyToOne(_ => Student)
  student: Student;

  @ManyToOne(_ => Mentor)
  mentor: Mentor;

  @Column()
  @Index()
  mentorId: number;

  @ManyToOne(_ => CourseTask)
  courseTask: CourseTask;

  @Column({ type: 'json', default: [] })
  formAnswers: FormRecords[];

  @Column({ nullable: true })
  score?: number;

  @Column({ nullable: true })
  comment?: string;
}
