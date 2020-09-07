import { Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseTask } from './courseTask';

// TODO: Left hardcoded (codewars:stage1|codewars:stage2) configs only for backward compatibility. Delete them in the future.
export type TaskType =
  | 'jstask'
  | 'kotlintask'
  | 'objctask'
  | 'htmltask'
  | 'selfeducation'
  | 'codewars'
  | 'codewars:stage1'
  | 'codewars:stage2'
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

  @OneToMany(
    _ => CourseTask,
    (courseTask: CourseTask) => courseTask.task,
    { nullable: true },
  )
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

  @Column({ nullable: true })
  discipline: string;

  @Column({ type: 'json', default: {} })
  attributes: Record<string, any>;
}
