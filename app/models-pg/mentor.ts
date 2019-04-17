import {
  Entity,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './user';
import { Student } from './student';
import { Course } from './course';

@Entity()
export class Mentor {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Course, (course: Course) => course.mentors, { nullable: true })
  course: Course;

  @OneToOne(_ => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  userId: string;

  @OneToMany(_ => Student, student => student.mentor)
  students: Student[];

  @Column({ nullable: true })
  maxStudentsLimit: number;
}
