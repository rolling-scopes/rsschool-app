import { Entity, CreateDateColumn, ManyToOne, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';
import { Course } from './course';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(_ => Course, { nullable: true })
  course?: Course;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne(_ => User)
  fromUser: User;

  @Column()
  fromUserId: number;

  @ManyToOne(_ => User)
  toUser: User;

  @Column()
  toUserId: number;

  @Column({ nullable: true, type: 'varchar' })
  comment: string | null;

  @Column({ nullable: true, default: 'Thank_you' })
  badgeId: string;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: number;
}
