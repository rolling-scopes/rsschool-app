import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

type EnglishLevel = 'A0' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+' | 'C2';

@Entity()
export class CV {
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
  englishLevel: EnglishLevel;

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
  location: string;

  @Column({ nullable: true, type: 'text' })
  githubUsername: string;

  @Column({ nullable: true, type: 'text' })
  website: string;
}
