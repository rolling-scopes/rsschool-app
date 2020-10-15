import { Entity, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { Course } from './course';

type ParticipantType = 'mentor' | 'student';

export type RegistryStatus = 'inactive' | 'pending' | 'approved' | 'rejected';

@Entity()
export class Registry {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(_ => User, (user: User) => user.registries, { nullable: true })
  user: User | number;

  @Column()
  userId: number;

  @ManyToOne(_ => Course, (course: Course) => course.registries, { nullable: true })
  course: Course;

  @Column()
  courseId: number;

  @Column({ name: 'type' })
  type: ParticipantType;

  @Column({ name: 'status', default: 'pending' })
  status: RegistryStatus;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'json', default: {} })
  attributes: {
    maxStudentsLimit: number;
    experienceInYears: string;
  };

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;
}
