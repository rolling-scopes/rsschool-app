import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';
import { Course } from './course';

@Entity('course_leave_survey_responses')
export class CourseLeaveSurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  courseId: string;

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
