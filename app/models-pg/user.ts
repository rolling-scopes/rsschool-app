import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export interface EducationRecord {
    graduationYear: number;
    faculty: string;
    university: string;
}

@Entity()
export class User {
    @PrimaryGeneratedColumn() id: number;

    @Column({ name: 'githubId', unique: true })
    githubId: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @CreateDateColumn()
    createdDate = Date.now();

    @CreateDateColumn()
    modifiedDate = Date.now();

    @Column()
    firstNameNative: string;

    @Column()
    lastNameNative: string;

    @Column({
        type: 'enum',
        enum: ['male', 'female', 'other'],
        nullable: true,
    })
    gender: 'male' | 'female' | 'other' | null;

    @Column({ nullable: true })
    tshirtSize: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' = 'm';

    @Column({ nullable: true })
    tshirtFashion: 'a' | 'b' = 'a';

    @CreateDateColumn({ nullable: true })
    dateOfBirth: number;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    country: string;

    @Column({
        type: 'enum',
        enum: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'],
        nullable: true,
    })
    englishLevel: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

    @Column({
        type: 'json',
        default: [],
    })
    educationHistory: EducationRecord[] = [];

    @Column({
        type: 'json',
        default: [],
    })
    employmentHistory: any = [];

    @Column({ nullable: true })
    contactsEpamEmail: string;

    @Column({ nullable: true })
    contactsPhone: string;

    @Column({ nullable: true })
    contactsEmail: string;
}
