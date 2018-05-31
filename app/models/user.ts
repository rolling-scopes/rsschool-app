import { Document, Schema, model } from 'mongoose';

export interface IUserSession {
    _id: string;
    roles: Array<'admin' | 'mentor' | 'student'>;
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

export interface IUser extends IUserSession {
    profile: Partial<IUserProfile>;
}

export interface IUserModel extends IUser, Document {
    _id: string;
}

export const UserSchema: Schema = new Schema({
    _id: String,
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
    roles: [String],
});

export const UserModelName = 'User';
export const UserDocument = model<IUserModel>(UserModelName, UserSchema);
