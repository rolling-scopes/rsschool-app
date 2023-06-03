import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  @Index()
  updatedDate: number;

  @Column()
  @Index()
  event: string;

  @Column({ nullable: true })
  entityId?: number;

  @Column({ enum: ['insert', 'update', 'remove'] })
  operation: 'insert' | 'update' | 'remove';

  @Column({ type: 'json', nullable: true })
  update?: unknown;

  @Column({ type: 'json', nullable: true })
  previous?: unknown;
}
