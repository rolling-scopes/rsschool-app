import {
    Entity,
    OneToOne,
    JoinColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import { User } from './user';
import { Course } from './course';
import { Mentor } from './mentor';
import { Stage } from './stage';

@Entity()
export class Student {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @OneToOne(_ => Course)
    @JoinColumn()
    course: Course;

    @OneToOne(_ => User)
    @JoinColumn()
    user: User;

    @ManyToOne(_ => Mentor, (mentor: Mentor) => mentor.students)
    mentor: Mentor;

    @OneToOne(_ => Stage)
    @JoinColumn()
    stage: Stage;

    @Column({ default: false })
    isExpelled: boolean;

    @Column({ nullable: true })
    expellingReason: string;

    @Column({ default: false })
    courseCompleted: boolean;

    @Column({ default: false })
    isTopPerformer: boolean;

    @Column({ nullable: true })
    employedOutsideEpam: boolean;

    @Column({ nullable: true })
    preferedMentorGithubId: string;

    @Column({ nullable: true })
    readyFullTime: boolean;
}
