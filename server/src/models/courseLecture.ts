import { Entity, ManyToOne, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './lecture';
import { Course } from './course';

@Entity()
export class CourseEvent {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Event, (lecture: Event) => lecture.courseLectures)
  event: Event | number;

  @ManyToOne(_ => Course, (course: Course) => course.stages)
  course: Course;

  @Column({ type: 'timestamptz', nullable: true })
  startDateTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDateTime: Date;
}
