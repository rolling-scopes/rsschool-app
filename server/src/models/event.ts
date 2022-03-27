import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CourseEvent } from './courseEvent';
import { Discipline } from './discipline';

@Entity()
export class Event {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  descriptionUrl: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'regular' })
  type: string;

  @OneToMany(_ => CourseEvent, (courseLecture: CourseEvent) => courseLecture.event, { nullable: true })
  courseEvents: CourseEvent[] | null;

  @ManyToOne(() => Discipline, { onDelete: 'SET NULL' })
  @JoinColumn()
  discipline: Discipline;
}
