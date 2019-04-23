import { Entity, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';
import { CourseTask } from './courseTask';

@Entity()
export class StudentTask {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @OneToOne(_ => CourseTask)
  @JoinColumn({ name: 'courseTaskId', referencedColumnName: 'id' })
  courseTaskId: number;

  @OneToOne(_ => User)
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  studentId: number;
}
