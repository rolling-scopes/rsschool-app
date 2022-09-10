import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobPost } from './job-post';
import { User } from './user';

export enum JobPostApplyStatus {
  Active = 'active',
  Cancelled = 'cancelled',
}

@Entity()
export class JobPostApply {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  public createdDate: number;

  @UpdateDateColumn()
  public updatedDate: number;

  @ManyToOne(_ => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column()
  @Index()
  public userId: number;

  @ManyToOne(_ => JobPost)
  @JoinColumn({ name: 'jobPostId' })
  public jobPost: JobPost;

  @Column()
  @Index()
  public jobPostId: number;
}
