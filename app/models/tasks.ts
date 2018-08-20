import { Document, Schema, model } from 'mongoose';

export interface ITasks {
    endDateTime: number;
    startDateTime: number;
    taskType: string;
    title: string;
    type: string;
    urlToDescription: string;
}

export interface ITasksModel extends ITasks, Document {
    _id: string;
}

const CourseSchema: Schema = new Schema({
    _id: String,
    endDateTime: { type: Number, default: 0 },
    startDateTime: { type: Number, default: 0 },
    taskType: { type: String, default: 'task' },
    title: {
        default: '',
        required: true,
        type: String,
    },
    type: { type: String, default: 'task' },
    urlToDescription: { type: String, default: '' },
});

const TasksModelName = 'tasks';

export const TaskModel = model<ITasksModel>(TasksModelName, CourseSchema);
