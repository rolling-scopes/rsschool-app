import { Document, Schema, model } from 'mongoose';
import { IUserBase } from './user';

export interface ICouseUser {
    city: string;
    courseId: string;
    userId: string;
    excludeReason: string | undefined;
    isActive: boolean;
}

export interface ICourseMentor extends ICouseUser {
    menteeCapacity: number;
    mentees: Array<IUserBase>;
    preferedMentees: Array<IUserBase>;
}

export interface ICourseMentorModel extends ICourseMentor, Document {
    _id: string;
}

export const CourseMentorScheme: Schema = new Schema({
    city: String,
    courseId: String,
    excludeReason: { type: String, default: undefined },
    isActive: { type: Boolean, default: true },
    menteeCapacity: { type: Number, default: 5 },
    mentees: { type: [{ _id: { type: String } }], default: [] },
    preferedMentees: { type: [{ _id: { type: String } }], default: [] },
    userId: String,
});

export const CourseMentorModelName = 'CourseMentor';
export const CourseMentorDocument = model<ICourseMentorModel>(CourseMentorModelName, CourseMentorScheme);
