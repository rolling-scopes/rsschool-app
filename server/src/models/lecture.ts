import { Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseLecture } from './courseLecture';

@Entity()
export class Lecture {
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

  @OneToMany(_ => CourseLecture, (courseLecture: CourseLecture) => courseLecture.lecture, { nullable: true })
  courseLectures: CourseLecture[] | null;
}
