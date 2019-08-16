import { Entity, ManyToOne, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Lecture } from './lecture';
import { Course } from './course';

@Entity()
export class CourseLecture {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Lecture, (lecture: Lecture) => lecture.courseLectures)
  lecture: Lecture | number;

  @ManyToOne(_ => Course, (course: Course) => course.stages)
  course: Course;

  @Column({ type: 'timestamptz', nullable: true })
  startDateTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDateTime: Date;
}
