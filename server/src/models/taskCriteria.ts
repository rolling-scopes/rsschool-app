import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

interface Criteria {
  max?: number;
  type: 'title' | 'subtask' | 'penalty';
  text: string;
}

@Entity()
export class TaskCriteria {
  constructor(taskId: number, criteria: Criteria[] = []) {
    this.taskId = taskId;
    this.criteria = criteria;
  }
  @PrimaryColumn()
  taskId: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column({ type: 'jsonb', default: [] })
  criteria: Criteria[];
}
