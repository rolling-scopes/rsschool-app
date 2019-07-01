import { Entity, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { Course } from './course';

@Entity()
export class Registry {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(_ => User, (user: User) => user.registries, { nullable: true })
  user: User | number;

  @ManyToOne(_ => Course, (course: Course) => course.registries, { nullable: true })
  course: Course | number;

  @Column({ name: 'type', enum: ['mentor', 'mentee'] })
  type: string;

  @Column({ name: 'status', enum: ['inactive', 'pending', 'approved', 'rejected'] })
  status: string;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;
}
