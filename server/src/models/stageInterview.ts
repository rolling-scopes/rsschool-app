import { Entity, Column, CreateDateColumn, ManyToOne, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Mentor } from './mentor';
import { Student } from './student';
import { Stage } from './stage';

@Entity()
export class StageInterview {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(_ => Mentor)
  mentor: Mentor;

  @Column()
  mentorId: number;

  @ManyToOne(_ => Stage)
  stage: Stage;

  @Column()
  stageId: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  decision: string;

  @Column({ nullable: true })
  isGoodCandidate: boolean;
}
