import { Entity, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { PreferredStudentsLocation } from 'common/enums/mentor';

@Entity()
export class MentorRegistry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(_ => User)
  user: User;

  @Column({ unique: true })
  userId: number;

  @Column({ type: 'simple-array', default: '' })
  preferedCourses: string[];

  @Column({ type: 'simple-array', default: '' })
  preselectedCourses: string[];

  @Column({ type: 'simple-array', default: '' })
  technicalMentoring: string[];

  @Column()
  maxStudentsLimit: number;

  @Column()
  englishMentoring: boolean;

  @Column({ type: 'simple-array', default: '' })
  languagesMentoring: string[];

  @Column('varchar')
  preferedStudentsLocation: PreferredStudentsLocation;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column({ default: false, type: 'boolean' })
  canceled: boolean;
}
