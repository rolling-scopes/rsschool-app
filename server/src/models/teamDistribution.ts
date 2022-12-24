import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Course } from './course';
import { CourseTask } from './courseTask';
import { Student } from './student';
import { Team } from './team';

@Entity()
export class TeamDistribution {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(_ => Course, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  @Index()
  courseId: number;

  @Column({ type: 'timestamptz', nullable: true })
  distributionStartDate: null | Date;

  @Column({ type: 'timestamptz', nullable: true })
  distributionEndDate: null | Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(_ => CourseTask, courseTask => courseTask.teamDistribution)
  courseTasks: CourseTask[];

  @ManyToMany(_ => Student, student => student.teamDistribution)
  students: Student[];

  @Column({ nullable: true })
  minStudents: number;

  @Column({ nullable: true })
  maxStudents: number;

  @Column({ nullable: true })
  studentsCount: number;

  @Column()
  isStrictStudentsCount: boolean;

  @OneToMany(_ => Team, team => team.teamDistribution)
  teams: Team[];
}
