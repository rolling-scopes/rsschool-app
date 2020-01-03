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

  @Column()
  maxStudentsLimit: number;

  @Column()
  englishMentoring: boolean;

  @Column()
  preferedStudentsLocation: 'any' | 'country' | 'city';

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column({ nullable: true })
  comment: string;
}
