import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Course } from './course';

@Entity()
export class Stage {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @Column()
    name: string;

    @ManyToOne(_ => Course, (course: Course) => course.stages)
    course: Course;
}
