import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course, Task, User } from './index';

@Entity()
export class BestWork {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  imageUrl: string;

  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @ManyToMany(_ => User)
  @JoinTable()
  users: User[];

  @ManyToOne(_ => Task)
  task: Task;

  @ManyToOne(_ => Course)
  course: Course;
}
