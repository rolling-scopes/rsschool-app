import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, Index } from 'typeorm';
import { Student } from './student';
import { TeamDistribution } from './teamDistribution';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
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

  @Column({ default: '' })
  chatLink: string;

  @Column({ default: '' })
  password: string;
}
