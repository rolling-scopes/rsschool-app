import { Document, Schema, model } from 'mongoose';

export enum UserFeedActionTypes {
    signedup = 'signedup',
}

export interface IUserBase {
    _id: string;
}

export interface IUserSession extends IUserBase {
    role: 'mentor' | 'student';
    isAdmin: boolean;
}

export enum Gender {
    'male',
    'female',
}

export enum YearsInFrontEnd {
    'less than 1 year',
    'less than 2 years',
    '2-5 years',
    'more than 5 years',
}

export interface IUserProfile {
    city: string;
    employmentHistory: string;
    englishLevel: string;
    firstName: string;
    firstNameNative: string;
    isInternshipNeeded: boolean;
    isWorkNeeded: boolean;
    lastName: string;
    lastNameNative: string;
    notes: string;
    emails: Array<{ value: string; primary: boolean }>;
    contacts: {
        phone: string;
        skype: string;
        telegram: string;
        other: string;
    };
    primaryEducation: {
        university: string;
        graduationYear: number;
        faculty: string;
    };
    dateOfBirth: string;
    gender: Gender;
    tShirtSize: string;
    epamDetails: {
        isEPAMEmployee: boolean;
        epamEmail?: string;
        epamUpsaId?: string;
    };
    experience: {
        yearsInFrontEnd?: YearsInFrontEnd;
        isStudiedAtRSSchool: boolean;
        hadMentoringExperience: boolean;
    };
    mentoring: {
        amountStudents: string;
        mentoringTogetherWith: string;
        stages: string;
    };
    githubId: string;
}

export interface IUserParticipation {
    _id: string;
    isActive: boolean;
    courseId: string;
    role: 'mentor' | 'student';
}

export interface IUser extends IUserSession {
    profile: Partial<IUserProfile>;
    participations: IUserParticipation[];
}

export interface IUserModel extends IUser, Document {
    _id: string;
}

export const UserSchema: Schema = new Schema({
    _id: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    participations: {
        default: [],
        type: [
            {
                courseId: String,
                isActive: { type: Boolean, default: true },
                role: { type: String, default: '' },
            },
        ],
    },
    profile: {
        city: { type: String, default: '' },
        contacts: {
            other: { type: String, default: '' },
            phone: { type: String, default: '' },
            skype: { type: String, default: '' },
            telegram: { type: String, default: '' },
        },
        dateOfBirth: { type: String, default: '' },
        emails: { type: Array, default: [] },
        employmentHistory: { type: String, default: '' },
        englishLevel: { type: String, default: '' },
        epamDetails: {
            epamEmail: { type: String, default: '' },
            epamUpsaId: { type: String, default: '' },
            isEPAMEmployee: { type: Boolean, default: false },
        },
        experience: {
            hadMentoringExperience: { type: Boolean, default: false },
            isStudiedAtRSSchool: { type: Boolean, default: false },
            yearsInFrontEnd: { type: String, default: '' },
        },
        firstName: { type: String, default: '' },
        firstNameNative: { type: String, default: '' },
        gender: { type: String, default: 'male' },
        githubId: { type: String, default: '' },
        isInternshipNeeded: { type: Boolean, default: false },
        isWorkNeeded: { type: Boolean, default: false },
        lastName: { type: String, default: '' },
        lastNameNative: { type: String, default: '' },
        mentoring: {
            amountStudents: { type: String, default: '' },
            mentoringTogetherWith: { type: String, default: '' },
            stages: { type: String, default: '' },
        },
        notes: { type: String, default: '' },
        primaryEducation: {
            faculty: { type: String, default: '' },
            graduationYear: { type: Number, default: '' },
            university: { type: String, default: '' },
        },
        tShirtSize: { type: String, default: '' },
    },
    role: { type: String, required: true },
});

const UserModelName = 'User';
export const UserModel = model<IUserModel>(UserModelName, UserSchema);
