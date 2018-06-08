import { Document, Schema, model } from 'mongoose';

export interface ICourse {
    description: string;
    endDateTime: number;
    name: string;
    startDateTime: number;
    isActive: boolean;
}

export interface ICourseModel extends ICourse, Document {
    _id: string;
}

const CourseSchema: Schema = new Schema({
    _id: String,
    description: { type: String, default: '' },
    endDateTime: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
    name: {
        default: '',
        required: true,
        type: String,
    },
    startDateTime: { type: Number, default: 0 },
});

const CourseModelName = 'Course';

export const CourseModel = model<ICourseModel>(CourseModelName, CourseSchema);
