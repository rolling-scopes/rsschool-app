import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Feedback {
    @PrimaryGeneratedColumn() id: number;

    @OneToOne(_ => User)
    @JoinColumn({ name: 'toGithubId', referencedColumnName: 'githubId' })
    toGithubId: string;

    @OneToOne(_ => User)
    @JoinColumn({ name: 'fromGithubId', referencedColumnName: 'githubId' })
    fromGithubId: string;
}
