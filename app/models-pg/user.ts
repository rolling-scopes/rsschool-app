import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export interface EducationRecord {
    graduationYear: number;
    faculty: string;
    university: string;
}

@Entity()
export class User {
    @PrimaryGeneratedColumn() id: number;

    @Column({ name: 'github_id', unique: true })
    githubId: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @CreateDateColumn({ name: 'created_date' })
    createdDate = Date.now();

    @CreateDateColumn({ name: 'modified_date' })
    modifiedDate = Date.now();

    @Column({ name: 'first_name_native' })
    firstNameNative: string;

    @Column({ name: 'last_name_native' })
    lastNameNative: string;

    @Column({
        name: 'gender',
        type: 'enum',
        enum: ['male', 'female', 'other'],
        nullable: true,
    })
    gender: 'male' | 'female' | 'other' | null;

    @Column({ name: 'tshirt_size', nullable: true })
    tshirtSize: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' = 'm';

    @Column({ name: 'tshirt_fashion', nullable: true })
    tshirtFashion: 'a' | 'b' = 'a';

    @CreateDateColumn({ name: 'date_of_birth', nullable: true })
    dateOfBirth: number;

    @Column({ name: 'city', nullable: true })
    city: string;

    @Column({ name: 'country', nullable: true })
    country: string;

    @Column({
        name: 'english_level',
        type: 'enum',
        enum: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'],
        nullable: true,
    })
    englishLevel: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

    @Column({
        name: 'education_history',
        type: 'json',
        default: [],
    })
    educationHistory: EducationRecord[] = [];

    @Column({
        name: 'employment_history',
        type: 'json',
        default: [],
    })
    employmentHistory: any = [];

    @Column({ name: 'contacts_epam_email', nullable: true })
    contactsEpamEmail: string;

    @Column({ name: 'contacts_phone', nullable: true })
    contactsPhone: string;

    @Column({ name: 'contacts_email', nullable: true })
    contactsEmail: string;
}
