import { Document, Schema, model } from 'mongoose';

export interface IUserSession {
    _id: string;
    roles: Array<'admin' | 'mentor' | 'student'>;
}

export interface IUserProfile {
    education: Array<{ university: string; graduationYear: number; faculty: string }>;
    emails: Array<{ value: string; type: string | undefined }>;
    employmentHistory: string;
    englishLevel: string;
    familyName: string;
    givenName: string;
    familyNameNative: string;
    givenNameNative: string;
    isInternshipNeeded: boolean;
    isWorkNeeded: boolean;
    notes: string;
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
        emails: { type: Array, default: [] },
        familyName: { type: String, default: '' },
        givenName: { type: String, default: '' },
    },
    roles: [String],
});

export const UserModelName = 'User';
export const UserDocument = model<IUserModel>(UserModelName, UserSchema);
