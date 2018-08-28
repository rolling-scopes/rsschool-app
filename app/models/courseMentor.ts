import { Document, Schema, model } from 'mongoose';
import { IUserBase, IUser } from './user';

export enum MentorSettings {
    ExtraMentees = 2,
}

export interface ICouseUser {
    city: string;
    courseId: string;
    userId: string;
    isActive: boolean;
    user?: IUser;
}

export interface ICourseMentor extends ICouseUser {
    menteeCapacity: number;
    mentees: Array<IUserBase | IUser>;
    preferedMentees: Array<IUserBase>;
}

export interface ICourseMentorModel extends ICourseMentor, Document {
    _id: string;
}

export const CourseMentorScheme: Schema = new Schema({
    city: { type: String, default: '' },
    courseId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    menteeCapacity: { type: Number, default: 5 },
    mentees: { type: [{ _id: { type: String } }], default: [] },
    preferedMentees: { type: [{ _id: { type: String } }], default: [] },
    userId: { type: String, required: true },
});

export const CourseMentorModelName = 'CourseMentor';
export const CourseMentorModel = model<ICourseMentorModel>(CourseMentorModelName, CourseMentorScheme);
