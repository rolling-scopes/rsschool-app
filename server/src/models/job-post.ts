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
import { Discipline } from './discipline';
import { User } from './user';

export enum JobPostStatus {
  Draft = 'draft',
  Review = 'review',
  Published = 'published',
  Closed = 'closed',
  Inactive = 'inactive',
}

export enum JobType {
  Remote = 'remote',
  Office = 'office',
  Any = 'any',
  Hybrid = 'hybrid',
}

@Entity()
export class JobPost {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  public createdDate: Date;

  @UpdateDateColumn()
  public updatedDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  public publishedDate: Date | null;

  @ManyToOne(_ => User)
  @JoinColumn({ name: 'authorId' })
  public author: User;

  @Column()
  @Index()
  public authorId: number;

  @Column({ type: 'enum', enum: JobPostStatus, default: JobPostStatus.Review })
  public status: JobPostStatus;

  @Column({ type: 'varchar', length: 256 })
  public title: string;

  @Column({ type: 'text' })
  public description: string;

  @Column({ type: 'enum', enum: JobType })
  public jobType: JobType;

  @Column({ type: 'varchar', length: 256 })
  public location: string;

  @Column({ type: 'varchar', length: 256 })
  public company: string;

  @ManyToOne(_ => Discipline)
  @JoinColumn({ name: 'disciplineId' })
  public discipline: Discipline;

  @Column()
  @Index()
  public disciplineId: number;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  public url: string | null;
}
