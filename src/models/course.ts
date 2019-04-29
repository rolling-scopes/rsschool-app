import { Entity, Column, CreateDateColumn, OneToMany, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Stage } from './stage';
import { Student } from './student';
import { Mentor } from './mentor';

@Entity()
export class Course {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  alias: string;

  @Column()
  year: number;

  @Column()
  primarySkillId: string;

  @Column()
  primarySkillName: string;

  @Column({ nullable: true })
  locationName: string;

  @OneToMany(_ => Stage, (stage: Stage) => stage.course)
  stages: Stage[];

  @OneToMany(_ => Student, (student: Student) => student.course)
  students: Student[];

  @OneToMany(_ => Mentor, (mentor: Mentor) => mentor.course)
  mentors: Mentor[];
}
