import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Student } from './student';
import { TeamDistribution } from './teamDistribution';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => TeamDistribution, teamDistribution => teamDistribution.teams)
  @JoinColumn()
  teamDistribution: TeamDistribution;

  @Column()
  description: string;

  @ManyToMany(() => Student, student => student.teams)
  students: Student[];

  @Column()
  chatLink: string;

  @Column()
  password: string;
}
