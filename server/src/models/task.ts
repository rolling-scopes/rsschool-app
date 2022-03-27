import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CourseTask } from './courseTask';
import { Discipline } from './discipline';

export type TaskType =
  | 'jstask'
  | 'kotlintask'
  | 'objctask'
  | 'htmltask'
  | 'ipynb'
  | 'selfeducation'
  | 'codewars'
  | 'test'
  | 'codejam'
  | 'interview'
  | 'stage-interview'
  | 'cv:html'
  | 'cv:markdown';

@Entity()
export class Task {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  descriptionUrl: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  githubPrRequired: boolean;

  @OneToMany(_ => CourseTask, (courseTask: CourseTask) => courseTask.task, { nullable: true })
  courseTasks: CourseTask[] | null;

  @Column({ nullable: true })
  verification: 'auto' | 'manual';

  @Column({ nullable: true })
  githubRepoName: string;

  @Column({ nullable: true })
  sourceGithubRepoUrl: string;

  @Column({ nullable: true })
  type: TaskType;

  @Column({ default: false })
  useJury: boolean;

  @Column({ default: false })
  allowStudentArtefacts: boolean;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ type: 'simple-array', default: '' })
  skills: string[];

  @ManyToOne(() => Discipline, { onDelete: 'SET NULL' })
  @JoinColumn()
  discipline: Discipline;

  @Column({ type: 'json', default: {} })
  attributes: Record<string, any>;
}
