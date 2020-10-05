import { Entity, CreateDateColumn, ManyToOne, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';
import { Course } from './course';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(_ => Course, { nullable: true })
  course?: Course | number;

  @ManyToOne(_ => User)
  fromUser: User | number;

  @ManyToOne(_ => User)
  toUser: User | number;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  badgeId: string;

  @Column({ nullable: true })
  heroesUrl: string;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;
}
