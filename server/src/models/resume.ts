import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  Generated,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { LanguageLevel } from './data';
import { User } from './user';

@Entity()
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Generated('uuid')
  @Column({ nullable: true })
  uuid: string;

  @ManyToOne(_ => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 256 })
  @Index()
  githubId: string;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  name: string;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  selfIntroLink: string;

  @Column({ nullable: true, type: 'varchar', length: 32 })
  startFrom: string;

  @Column({ default: false })
  fullTime: boolean;

  @Column({ nullable: true, type: 'numeric' })
  expires: number;

  @Column({ nullable: true, type: 'varchar', length: 32 })
  militaryService: string;

  @Column({ nullable: true, type: 'varchar', length: 8 })
  englishLevel: LanguageLevel;

  @Column({ nullable: true, type: 'varchar', length: 512 })
  avatarLink: string;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  desiredPosition: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'varchar', length: 32 })
  phone: string;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  email: string;

  @Column({ nullable: true, type: 'varchar', length: 128 })
  skype: string;

  @Column({ nullable: true, type: 'varchar', length: 128 })
  telegram: string;

  @Column({ nullable: true, type: 'varchar', length: 512 })
  linkedin: string;

  @Column({ nullable: true, type: 'varchar', length: 512 })
  locations: string;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  githubUsername: string;

  @Column({ nullable: true, type: 'varchar', length: 512 })
  website: string;

  @Column({ default: false })
  isHidden: boolean;

  @Column('int', { array: true, default: [] })
  visibleCourses: number[];
}
