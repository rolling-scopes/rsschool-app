import { Entity, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user';

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
  preferedStudentsLocation: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ default: false, type: 'boolean' })
  canceled: boolean;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  receivedDate: Date;

  @Column({ nullable: true })
  sendDate: Date;
}
