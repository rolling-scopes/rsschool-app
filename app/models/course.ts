import { Document, Schema, model } from 'mongoose';

export interface ICourse {
    id: string;
    description: string;
    endDateTime: number;
    name: string;
    startDateTime: number;
}

export interface ICourseModel extends ICourse, Document {
    id: string;
}

export const CourseSchema: Schema = new Schema({
    description: String,
    endDateTime: Number,
    name: {
        required: true,
        type: String,
    },
    startDateTime: Number,
});

export const CourseModelName = 'Course';

export const CourseDocument = model<ICourseModel>(CourseModelName, CourseSchema);
