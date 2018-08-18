import { Document, Schema, model } from 'mongoose';

export enum AssignmentStatus {
    Assigned = 'Assigned',
    Checked = 'Checked',
    Rejected = 'Rejected',
    ReadyForReview = 'ReadyForReview',
}

export interface IAssignment {
    taskId: string;
    title: string;
    courseId: string;
    studentId: string;
    mentorId: string;
    studentComment: string;
    mentorComment: string;
    score: number;
    assignmentRepo: string;
    deadlineDate: number;
    completeDate: number;
    checkDate: number;
    status: AssignmentStatus;
}

export interface IAssignmentModel extends Document, IAssignment {
    _id: string;
}

export const AssignmentSchema: Schema = new Schema({
    assignmentRepo: String,
    checkDate: Number,
    completeDate: Number,
    courseId: String,
    deadlineDate: Number,
    mentorComment: String,
    mentorId: String,
    score: Number,
    status: String,
    studentComment: String,
    studentId: String,
    taskId: String,
    title: String,
});

const AssignmentModelName = 'Assignment';
export const AssignmentModel = model<IAssignmentModel>(AssignmentModelName, AssignmentSchema);
