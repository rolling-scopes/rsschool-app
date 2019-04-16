import { Entity, Column, CreateDateColumn, OneToMany, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Stage } from './stage';

@Entity()
export class Course {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @Column()
    name: string;

    @Column()
    year: number;

    @Column()
    primarySkillId: string;

    @Column()
    primarySkillName: string;

    @OneToMany(_ => Stage, (stage: Stage) => stage.course)
    stages: Stage[];
}
