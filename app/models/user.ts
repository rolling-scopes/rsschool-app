import { Document, Schema, model } from 'mongoose';

export interface IUserSession {
    _id: string;
    role: 'mentor' | 'student';
    isAdmin: boolean;
}

export interface IUserProfile {
    primaryEducation: {
        university: string;
        graduationYear: string;
        faculty: string;
    };
    emails: Array<{ value: string; primary: boolean }>;
    employmentHistory: string;
    englishLevel: string;
    lastName: string;
    firstName: string;
    lastNameNative: string;
    firstNameNative: string;
    isInternshipNeeded: boolean;
    isWorkNeeded: boolean;
    notes: string;
    phone: string;
    city: string;
}

export interface IUserCourse {
    id: string;
    role: 'mentor' | 'student';
    mates: Array<{ id: string }>;
    isActive: boolean;
    excludeReason: string | undefined;
}

export interface IUser extends IUserSession {
    profile: Partial<IUserProfile>;
    courses: IUserCourse[];
}

export interface IUserModel extends IUser, Document {
    _id: string;
}

export const UserSchema: Schema = new Schema({
    _id: String,
    courses: {
        default: [],
        type: [
            {
                _id: false,
                excludeReason: { type: String, default: undefined },
                id: { type: String },
                isActive: { type: Boolean, default: true },
                mates: [{ id: { type: String, default: '' } }],
                role: { type: String, default: '' },
            },
        ],
    },
    isAdmin: Boolean,
    profile: {
        city: { type: String, default: '' },
        emails: { type: Array, default: [] },
        firstName: { type: String, default: '' },
        firstNameNative: { type: String, default: '' },
        lastName: { type: String, default: '' },
        lastNameNative: { type: String, default: '' },
        phone: { type: String, default: '' },
        primaryEducation: {
            faculty: { type: String, default: '' },
            graduationYear: { type: String, default: '' },
            university: { type: String, default: '' },
        },
    },
    role: String,
});

export const UserModelName = 'User';
export const UserDocument = model<IUserModel>(UserModelName, UserSchema);
