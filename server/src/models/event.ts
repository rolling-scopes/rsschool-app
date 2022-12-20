import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { CourseEvent } from './courseEvent';
import { Discipline } from './discipline';

@Entity()
export class Event {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: string;

  @DeleteDateColumn()
  deletedDate: string;

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

  @ManyToOne(() => Discipline, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'disciplineId' })
  discipline: Discipline | null;

  @Column({ nullable: true })
  disciplineId: number | null;
}
