import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Course {
    @PrimaryGeneratedColumn() id: number;

    @Column({ type: 'text' })
    name: string;

    @Column()
    year: number;
}
