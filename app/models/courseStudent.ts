import { Document, Schema, model } from 'mongoose';
import { ICouseUser } from './courseMentor';
import { IUserBase } from './user';

export interface ICourseStudent extends ICouseUser {
    englishLevel: string;
    mentors: Array<IUserBase>;
}

export interface ICourseStudentModel extends ICourseStudent, Document {
    _id: string;
}

export const CourseStudentScheme: Schema = new Schema({
    city: String,
    courseId: String,
    englishLevel: { type: String, default: '' },
    excludeReason: { type: String, default: undefined },
    isActive: { type: Boolean, default: true },
    mentors: { type: [{ _id: { type: String } }], default: [] },
    userId: String,
});

export const CourseStudentModelName = 'CourseStudent';
export const CourseStudentDocument = model<ICourseStudentModel>(CourseStudentModelName, CourseStudentScheme);
