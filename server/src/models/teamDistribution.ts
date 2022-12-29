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

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @OneToMany(_ => CourseTask, courseTask => courseTask.teamDistribution)
  courseTasks: CourseTask[];

  @ManyToMany(_ => Student, student => student.teamDistribution)
  students: Student[];

  @Column({ default: 2 })
  minStudents: number;

  @Column({ default: 4 })
  maxStudents: number;

  @Column({ default: 3 })
  studentsCount: number;

  @Column({ default: true })
  strictStudentsCount: boolean;

  @Column({ default: 0 })
  minTotalScore: number;

  @OneToMany(() => Team, team => team.teamDistribution)
  teams: Team[];
}
