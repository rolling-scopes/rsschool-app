import {
    Entity,
    JoinColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { StudentTask } from './studentTask';

@Entity()
export class TaskResult {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @OneToOne(_ => StudentTask)
    @JoinColumn({ name: 'studentTaskId', referencedColumnName: 'id' })
    studentTaskId: number;

    @Column({ nullable: true })
    githubPrUrl: string;

    @Column()
    score: number;

    @Column({ nullable: true })
    comment: string;
}
