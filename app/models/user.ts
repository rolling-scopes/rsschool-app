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

export interface IUserProfile {
    city: string;
    emails: Array<{ value: string; primary: boolean }>;
    employmentHistory: string;
    englishLevel: string;
    firstName: string;
    firstNameNative: string;
    githubId: string;
    isInternshipNeeded: boolean;
    isWorkNeeded: boolean;
    lastName: string;
    lastNameNative: string;
    notes: string;
    phone: string;
    primaryEducation: {
        university: string;
        graduationYear: string;
        faculty: string;
    };
    notifications: {
        readyToReceive: string;
        fromTime: string;
        toTime: string;
        typeDeadline: boolean;
        typeScore: boolean;
        typeSessionLecturer: boolean;
        typeSessionStudent: boolean;
        typeStatusMentor: boolean;
        typeStatusStudent: boolean;
        telegramUserName: string;
    };
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
        emails: { type: Array, default: [] },
        firstName: { type: String, default: '' },
        firstNameNative: { type: String, default: '' },
        githubId: { type: String, default: '' },
        lastName: { type: String, default: '' },
        lastNameNative: { type: String, default: '' },
        notifications: {
            fromTime: { type: String, default: '' },
            readyToReceive: { type: String, default: 'no' },
            telegramUserName: { type: String, default: '' },
            toTime: { type: String, default: '' },
            typeDeadline: { type: Boolean, default: false },
            typeScore: { type: Boolean, default: false },
            typeSessionLecturer: { type: Boolean, default: false },
            typeSessionStudent: { type: Boolean, default: false },
            typeStatusMentor: { type: Boolean, default: false },
            typeStatusStudent: { type: Boolean, default: false },
        },
        phone: { type: String, default: '' },
        primaryEducation: {
            faculty: { type: String, default: '' },
            graduationYear: { type: String, default: '' },
            university: { type: String, default: '' },
        },
    },
    role: { type: String, required: true },
});

const UserModelName = 'User';
export const UserModel = model<IUserModel>(UserModelName, UserSchema);
