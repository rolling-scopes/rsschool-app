import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { StageInterviewFeedback } from './stageInterviewFeedback';
import { Mentor } from './mentor';
import { Student } from './student';
import { Stage } from './stage';
import { Course, CourseTask } from '.';

@Entity()
export class StageInterview {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Student, (student: Student) => student.stageInterviews)
  student: Student;

  @OneToMany(
    _ => StageInterviewFeedback,
    (StageInterviewFeedback: StageInterviewFeedback) => StageInterviewFeedback.stageInterview,
  )
  stageInterviewFeedbacks: StageInterviewFeedback[];

  @Column()
  @Index()
  studentId: number;

  @ManyToOne(_ => Mentor)
  mentor: Mentor;

  @Column()
  @Index()
  mentorId: number;

  @ManyToOne(_ => Stage, { nullable: true })
  stage: Stage;

  @Column({ nullable: true })
  stageId: number;

  @ManyToOne(_ => CourseTask, { nullable: true })
  courseTask: CourseTask;

  @Column({ nullable: true })
  courseTaskId: number;

  @ManyToOne(_ => Course, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isCanceled: boolean;

  @Column({ nullable: true })
  decision: string;

  @Column({ nullable: true })
  isGoodCandidate: boolean;
}
