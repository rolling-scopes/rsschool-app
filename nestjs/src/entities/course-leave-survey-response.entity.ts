import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course, User } from '../../../server/src/models';

@Entity('course_leave_survey_responses')
export class CourseLeaveSurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer' })
  courseId: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'text', array: true, nullable: true })
  reasonForLeaving: string[];

  @Column({ type: 'text', nullable: true })
  otherComment: string;

  @CreateDateColumn({ type: 'timestamp' })
  submittedAt: Date;
}
