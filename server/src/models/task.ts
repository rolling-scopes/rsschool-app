import { Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseTask } from './courseTask';

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

  @Column()
  verification: 'auto' | 'manual';

  @Column({ nullable: true })
  githubRepoName: string;

  @Column({ nullable: true })
  sourceGithubRepoUrl: string;

  @Column({ nullable: true })
  type: 'jstask' | 'htmltask' | 'htmlcssacademy' | 'codewars' | 'test' | 'codejam' | 'interview';

  @Column({ default: false })
  useJury: boolean;

  @Column({ default: false })
  allowStudentArtefacts: boolean;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];
}
