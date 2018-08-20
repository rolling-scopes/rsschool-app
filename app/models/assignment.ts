import { Document, Schema, model } from 'mongoose';

export enum AssignmentStatus {
    Assigned = 'Assigned',
    ReadyForReview = 'ReadyForReview',
    Rejected = 'Rejected',
    Checked = 'Checked',
}

export interface IAssignment {
    assignmentRepo?: string;
    checkDate?: number;
    completeDate?: number;
    courseId: string;
    deadlineDate: number;
    mentorComment?: string;
    mentorId?: string;
    score: number;
    status: AssignmentStatus;
    studentComment?: string;
    studentId: string;
    taskId: string;
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
});

export const AssignmentModelName = 'Assignment';
export const AssignmentModel = model<IAssignmentModel>(AssignmentModelName, AssignmentSchema);
