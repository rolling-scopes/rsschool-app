import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseRole } from './session';

@Entity()
export class UserGroup {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column('int', { array: true })
  users: number[];

  @Column('text', { array: true })
  roles: CourseRole[];
}
