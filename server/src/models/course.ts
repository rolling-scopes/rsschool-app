import {
  Entity,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { DiscordServer } from './discordServer';
import { Student } from './student';
import { Mentor } from './mentor';
import { Registry } from './registry';
import { Discipline } from './discipline';

@Entity()
export class Course {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ unique: true })
  name: string;

  @Column()
  fullName: string;

  @Index()
  @Column({ unique: true })
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
  registrationEndDate: Date | null;

  @Column({ nullable: true })
  primarySkillId: string;

  @Column({ nullable: true })
  primarySkillName: string;

  @Column({ nullable: true })
  locationName: string;

  @OneToMany(_ => Student, (student: Student) => student.course)
  students: Student[];

  @OneToMany(_ => Mentor, (mentor: Mentor) => mentor.course)
  mentors: Mentor[];

  @OneToMany(_ => Registry, (registry: Registry) => registry.course, { nullable: true })
  registries: Registry[] | null;

  @ManyToOne(_ => DiscordServer, (discordServer: DiscordServer) => discordServer.courses, { nullable: true })
  discordServer: DiscordServer;

  @Index()
  @Column({ nullable: true })
  discordServerId: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ default: false })
  planned: boolean;

  @Column({ default: false })
  inviteOnly: boolean;

  @Column({ nullable: true })
  certificateIssuer: string;

  @Column({ default: true })
  usePrivateRepositories: boolean;

  @Column({ default: true })
  personalMentoring: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  personalMentoringStartDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  personalMentoringEndDate: Date | null;

  @Column({ nullable: true })
  logo: string;

  @ManyToOne(() => Discipline, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'disciplineId' })
  discipline: Discipline | null;

  @Column({ nullable: true })
  disciplineId: number | null;

  @Column({ default: 2, nullable: true })
  minStudentsPerMentor: number;

  @Column({ default: 70 })
  certificateThreshold: number;

  @Column({ nullable: true, type: 'varchar' })
  wearecommunityUrl: string | null;
}
