import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Student } from './student';
import { Mentor } from './mentor';
import { ProfilePermissions } from './profilePermissions';
import { Feedback } from './feedback';
import { Registry } from './registry';
import { CourseManager } from './courseManager';
import { CourseUser } from './courseUser';

export interface EducationRecord {
  graduationYear: number;
  faculty: string;
  university: string;
}

export interface EmploymentRecord {
  title: string;
  dateTo: string;
  dateFrom: string;
  companyName: string;
  toPresent: boolean;
}

type EnglishLevel = 'a0' | 'a1' | 'a1+' | 'a2' | 'a2+' | 'b1' | 'b1+' | 'b2' | 'b2+' | 'c1' | 'c1+' | 'c2';

type TshirtSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';

type TshirtFashion = 'male' | 'female' | 'unisex';

export interface ExternalAccount {
  service: 'htmlacademy' | 'codeacademy' | 'codewars';
  username: string;
}

@Entity()
@Unique(['providerUserId', 'provider'])
export class User {
  @PrimaryGeneratedColumn() id: number;

  @Column({ nullable: true })
  primaryEmail?: string;

  @Column({ name: 'githubId', unique: true })
  @Index({ unique: true })
  githubId: string;

  @Column({ nullable: true, type: 'varchar', length: 64 })
  @Index()
  providerUserId?: string;

  @Column({ nullable: true, type: 'varchar', length: 32 })
  provider?: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @CreateDateColumn()
  createdDate?: number;

  @UpdateDateColumn()
  updatedDate?: number;

  @Column({ nullable: true })
  firstNameNative?: string;

  @Column({ nullable: true })
  lastNameNative?: string;

  @Column({ nullable: true })
  tshirtSize?: TshirtSize;

  @Column({ nullable: true })
  tshirtFashion?: TshirtFashion;

  @Column({ nullable: true, type: 'date' })
  dateOfBirth?: string;

  @Column({ nullable: true })
  locationName?: string;

  @Column({ nullable: true })
  locationId?: string;

  @Column({ default: false })
  opportunitiesConsent: boolean;

  @Column({ nullable: true, type: 'text' })
  cvLink?: string | null;

  @Column({ nullable: true, type: 'text' })
  militaryService?: string | null;

  @Column({ nullable: true })
  englishLevel?: EnglishLevel;

  @Column({
    type: 'json',
    default: [],
  })
  educationHistory: EducationRecord[] = [];

  @Column({
    type: 'json',
    default: [],
  })
  employmentHistory: EmploymentRecord[] = [];

  @Column({ nullable: true })
  epamApplicantId?: string;

  @Column({ nullable: true })
  contactsEpamEmail?: string;

  @Column({ nullable: true })
  contactsPhone?: string;

  @Column({ nullable: true })
  contactsEmail?: string;

  @Column({ nullable: true })
  contactsTelegram?: string;

  @Column({ nullable: true })
  contactsNotes?: string;

  @Column({ type: 'json', nullable: true })
  discord: any | null;

  @Column({ nullable: true })
  countryName?: string;

  @Column({ nullable: true })
  cityName?: string;

  @Column({ nullable: true })
  contactsSkype?: string;

  @Column({ nullable: true })
  contactsLinkedIn?: string;

  @Column({ nullable: true })
  aboutMyself?: string;

  @Column({
    type: 'json',
    default: [],
  })
  externalAccounts: ExternalAccount[] = [];

  @OneToMany(_ => Mentor, (mentor: Mentor) => mentor.user, { nullable: true })
  mentors: Mentor[] | null;

  @OneToMany(_ => Student, (student: Student) => student.user, { nullable: true })
  students: Student[] | null;

  @OneToMany(_ => Feedback, (feedback: Feedback) => feedback.fromUser, { nullable: true })
  givenFeedback: Feedback[] | null;

  @OneToMany(_ => Feedback, (feedback: Feedback) => feedback.toUser, { nullable: true })
  receivedFeedback: Feedback[] | null;

  @OneToMany(_ => Registry, (registry: Registry) => registry.course, { nullable: true })
  registries: Registry[] | null;

  @Column({ nullable: true })
  activist: boolean;

  @Column({ default: 0, type: 'bigint' })
  lastActivityTime: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => ProfilePermissions, profilePermissions => profilePermissions.user)
  @JoinColumn()
  profilePermissions: ProfilePermissions | null;

  @OneToMany(_ => CourseUser, (courseUser: CourseUser) => courseUser.user, { nullable: true })
  courseUsers: CourseUser[] | null;

  @BeforeInsert()
  beforeInsert?() {
    this.githubId = this.githubId.toLowerCase();
  }

  @BeforeUpdate()
  beforeUpdate?() {
    this.githubId = this.githubId.toLowerCase();
  }
}
