import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Student } from './student';
import { TeamDistribution } from './teamDistribution';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(_ => TeamDistribution, teamDistribution => teamDistribution.teams)
  @JoinColumn()
  teamDistribution: TeamDistribution;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(_ => Student, student => student.teams)
  students: Student[];
}
