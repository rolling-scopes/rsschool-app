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
  startDate: null | Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: null | Date;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(_ => CourseTask, courseTask => courseTask.teamDistribution)
  courseTasks: CourseTask[];

  @ManyToMany(_ => Student, student => student.teamDistribution)
  students: Student[];

  @Column({ nullable: true, default: 2 })
  minStudents: number;

  @Column({ nullable: true })
  maxStudents: number;

  @Column({ nullable: true, default: 3 })
  studentsCount: number;

  @Column({ default: true })
  strictStudentsCount: boolean;

  @Column({ default: 0 })
  minTotalScore: number;

  @OneToMany(() => Team, team => team.teamDistribution)
  teams: Team[];
}
