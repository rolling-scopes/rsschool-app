import { Document, Schema, model } from 'mongoose';

export interface IAssignments {
    assigmentRepo: string;
    checkDate: number;
    completeDate: number;
    courseId: string;
    deadlineDate: number;
    mentorComment: string;
    mentorId: string;
    score: number;
    status: string;
    studentComment: string;
    studentId: string;
    taskId: string;
    title: string;
}

export interface IAssignmentsModel extends IAssignments, Document {
    _id: string;
}

const CourseSchema: Schema = new Schema({
    assigmentRepo: { type: String, default: '' },
    checkDate: { type: Number, default: 0 },
    completeDate: { type: Number, default: 0 },
    courseId: { type: String, default: '' },
    deadlineDate: { type: Number, default: 0 },
    mentorComment: { type: String, default: '' },
    mentorId: { type: String, default: '' },
    score: { type: Number, default: 0 },
    status: { type: String, default: 'Assigned' },
    studentComment: { type: String, default: '' },
    studentId: { type: String, default: '' },
    taskId: { type: String, default: '' },
    title: { type: String, default: '' },
});

const AssignmentsModelName = 'assignments';

export const AssignmentsModel = model<IAssignmentsModel>(AssignmentsModelName, CourseSchema);
