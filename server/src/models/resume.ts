import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { LanguageLevel } from './data';

@Entity()
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  githubId: string;

  @Column({ nullable: true, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'text' })
  selfIntroLink: string;

  @Column({ nullable: true, type: 'text' })
  startFrom: string;

  @Column({ default: false })
  fullTime: boolean;

  @Column({ nullable: true, type: 'numeric' })
  expires: number;

  @Column({ nullable: true, type: 'text' })
  militaryService: string;

  @Column({ nullable: true, type: 'text' })
  englishLevel: LanguageLevel;

  @Column({ nullable: true, type: 'text' })
  avatarLink: string;

  @Column({ nullable: true, type: 'text' })
  desiredPosition: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'text' })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  email: string;

  @Column({ nullable: true, type: 'text' })
  skype: string;

  @Column({ nullable: true, type: 'text' })
  telegram: string;

  @Column({ nullable: true, type: 'text' })
  linkedin: string;

  @Column({ nullable: true, type: 'text' })
  locations: string;

  @Column({ nullable: true, type: 'text' })
  githubUsername: string;

  @Column({ nullable: true, type: 'text' })
  website: string;

  @Column({ default: false })
  isHidden: boolean;

  @Column('int', { array: true, default: [] })
  visibleCourses: number[];
}
