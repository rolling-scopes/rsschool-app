import {
    Entity,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user';
import { Course } from './course';

@Entity()
export class Feedback {
    @PrimaryGeneratedColumn() id: number;

    @OneToOne(_ => User)
    @JoinColumn({ name: 'toGithubId', referencedColumnName: 'githubId' })
    toGithubId: string;

    @OneToOne(_ => User)
    @JoinColumn({ name: 'fromGithubId', referencedColumnName: 'githubId' })
    fromGithubId: string;

    @OneToOne(_ => Course)
    @JoinColumn({ name: 'courseId', referencedColumnName: 'id' })
    courseId: number;

    @Column({ type: 'text' })
    text: string;

    @Column({ type: 'timestamp' })
    timestamp: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;
}
