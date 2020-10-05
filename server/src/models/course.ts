import { Entity, Column, CreateDateColumn, OneToMany, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Stage } from './stage';
import { Student } from './student';
import { Mentor } from './mentor';
import { Registry } from './registry';

@Entity()
@Unique(['name', 'alias'])
export class Course {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  alias: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  descriptionUrl: string;

  @Column({ nullable: true })
  year: number;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  registrationEndDate: Date;

  @Column({ nullable: true })
  primarySkillId: string;

  @Column({ nullable: true })
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

  @Column({ default: false })
  inviteOnly: boolean;
}
