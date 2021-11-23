import { Entity, Index, ManyToOne, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from './course';
import { User } from './user';

@Entity()
export class CourseUser {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Course)
  course: Course;

  @Column()
  @Index()
  courseId: number;

  @ManyToOne(_ => User)
  user: User;

  @Column()
  @Index()
  userId: number;

  @Column({ default: false })
  isManager: boolean;

  @Column({ default: false })
  isSupervisor: boolean;

  @Column({ default: false })
  isJuryActivist: boolean;
}
