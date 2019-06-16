import { Entity, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Registry {
  @PrimaryGeneratedColumn() id: number;

  @Column({ name: 'userId', unique: true })
  userId: number;

  @Column({ name: 'courseId', enum: ['js', 'ios'] })
  courseId: string;

  @Column({ name: 'type', enum: ['mentor', 'mentee'] })
  type: string;

  @Column({ name: 'status', enum: ['inactive', 'pending', 'approved', 'rejected'] })
  status: string;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;
}
