import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Course } from './course';
import { User } from './user';

@Entity()
export class CourseManager {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne((_) => Course)
  course: Course;

  @ManyToOne((_) => User)
  user: User;
}
