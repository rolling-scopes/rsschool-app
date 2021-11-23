import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Course } from './course';

@Entity()
export class DiscordServer {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column()
  gratitudeUrl: string;

  @Column({ nullable: true, type: 'text' })
  mentorsChatUrl: string | null;

  @OneToMany(_ => Course, (course: Course) => course.discordServer, { nullable: true })
  courses: Course[] | null;
}
