import { Entity, CreateDateColumn, Column, ManyToOne, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Mentor } from './mentor';

@Entity()
export class MentorFeedback {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Mentor)
  mentor: Mentor | number;

  @Column()
  text: string;
}
