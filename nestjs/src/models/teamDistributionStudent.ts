import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Course } from './course';
import { Student } from './student';
import { TeamDistribution } from './teamDistribution';

@Entity()
@Unique(['studentId', 'courseId', 'teamDistributionId'])
export class TeamDistributionStudent {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: string;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Student)
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(_ => Course)
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne(_ => TeamDistribution)
  teamDistribution: TeamDistribution;

  @Column()
  teamDistributionId: number;

  @Column({ default: false })
  distributed: boolean;

  @Column({ default: true })
  active: boolean;
}
