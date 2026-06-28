import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export enum CrossCheckCriteriaType {
  Title = 'title',
  Subtask = 'subtask',
  Penalty = 'penalty',
}

interface Criteria {
  max?: number;
  type: CrossCheckCriteriaType;
  text: string;
  key: string;
  index: number;
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
