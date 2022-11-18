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
  userId: number | null;

  @Column({ type: 'varchar', length: 256 })
  @Index()
  githubId: string;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  name: string | null;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  selfIntroLink: string | null;

  @Column({ nullable: true, type: 'varchar', length: 32 })
  startFrom: string | null;

  @Column({ default: false })
  fullTime: boolean;

  @Column({ nullable: true, type: 'numeric' })
  expires: number | null;

  @Column({ nullable: true, type: 'varchar', length: 32 })
  militaryService: string | null;

  @Column({ nullable: true, type: 'varchar', length: 8 })
  englishLevel: LanguageLevel | null;

  @Column({ nullable: true, type: 'varchar', length: 512 })
  avatarLink: string | null;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  desiredPosition: string | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({ nullable: true, type: 'varchar', length: 32 })
  phone: string | null;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  email: string | null;

  @Column({ nullable: true, type: 'varchar', length: 128 })
  skype: string | null;

  @Column({ nullable: true, type: 'varchar', length: 128 })
  telegram: string | null;

  @Column({ nullable: true, type: 'varchar', length: 512 })
  linkedin: string | null;

  @Column({ nullable: true, type: 'varchar', length: 512 })
  locations: string | null;

  @Column({ nullable: true, type: 'varchar', length: 256 })
  githubUsername: string | null;

  @Column({ nullable: true, type: 'varchar', length: 512 })
  website: string | null;

  @Column({ default: false })
  isHidden: boolean;

  @Column('int', { array: true, default: [] })
  visibleCourses: number[];
}
