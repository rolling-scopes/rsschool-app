import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StageInterviewFeedback } from './stageInterviewFeedback';
import { Mentor } from './mentor';
import { Student } from './student';
import { Stage } from './stage';
import { Course } from '.';

@Entity()
export class StageInterview {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(
    _ => Student,
    (student: Student) => student.stageInterviews,
  )
  student: Student;

  @OneToMany(
    _ => StageInterviewFeedback,
    (StageInterviewFeedback: StageInterviewFeedback) => StageInterviewFeedback.stageInterview,
  )
  stageInterviewFeedbacks: StageInterviewFeedback[];

  @Column()
  studentId: number;

  @ManyToOne(_ => Mentor)
  mentor: Mentor;

  @Column()
  mentorId: number;

  @ManyToOne(_ => Stage)
  stage: Stage;

  @Column()
  stageId: number;

  @ManyToOne(_ => Course, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  decision: string;

  @Column({ nullable: true })
  isGoodCandidate: boolean;
}
