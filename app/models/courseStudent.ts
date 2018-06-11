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
    city: { type: String, default: '' },
    courseId: { type: String, required: true },
    englishLevel: { type: String, default: '' },
    excludeReason: { type: String, default: undefined },
    isActive: { type: Boolean, default: true },
    mentors: { type: [{ _id: { type: String } }], default: [] },
    userId: { type: String, required: true },
});

export const CourseStudentModelName = 'CourseStudent';
export const CourseStudentModel = model<ICourseStudentModel>(CourseStudentModelName, CourseStudentScheme);
