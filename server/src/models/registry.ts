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

  @ManyToOne(_ => Course, (course: Course) => course.registries, { nullable: true })
  course: Course | number;

  @Column({ name: 'type' })
  type: ParticipantType;

  @Column({ name: 'status', default: 'pending' })
  status: RegistryStatus;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'json', default: {} })
  preferences: {
    maxStudentsLimit: number;
  };

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;
}
