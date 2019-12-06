import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from './student';
import { CourseTask } from './courseTask';

type ScoreRecord = {
  score: number;
  dateTime: number;
  comment: string;
  authorId: number;
};

@Entity()
export class TaskSolutionResult {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: string;

  @ManyToOne(_ => CourseTask)
  courseTask: CourseTask;

  @Column()
  courseTaskId: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(_ => Student)
  checker: Student;

  @Column()
  checkerId: number;

  @Column()
  score: number;

  @Column({ type: 'json', default: [] })
  historicalScores: ScoreRecord[] = [];

  @Column({ nullable: true })
  comment?: string;
}
