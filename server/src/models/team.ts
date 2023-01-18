import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, Index } from 'typeorm';
import { Student } from './student';
import { TeamDistribution } from './teamDistribution';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => TeamDistribution)
  teamDistribution: TeamDistribution;

  @Column()
  @Index()
  teamDistributionId: number;

  @Column({ default: '' })
  description: string;

  @ManyToMany(() => Student, student => student.teams, { nullable: true })
  students: Student[];

  @Column({ nullable: true })
  teamLeadId: number;

  @Column({ nullable: true })
  chatLink: string;

  @Column()
  password: string;
}
