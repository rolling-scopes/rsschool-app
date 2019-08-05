import { Entity, Column, CreateDateColumn, OneToMany, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Stage } from './stage';
import { Student } from './student';
import { Mentor } from './mentor';
import { Registry } from './registry';

@Entity()
export class Course {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  alias: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  descriptionUrl: string;

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

  @OneToMany(_ => Registry, (registry: Registry) => registry.course, { nullable: true })
  registries: Registry[] | null;

  @Column({ default: false })
  completed: boolean;

  @Column({ default: false })
  planned: boolean;
}
