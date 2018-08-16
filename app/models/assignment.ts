import { Document, Schema, model } from 'mongoose';

export enum AssignmentStatus {
    Assigned = 'Assigned',
    Checked = 'Checked',
    Rejected = 'Rejected',
    ReadyForReview = 'ReadyForReview',
}

export interface IAssignment {
    taskId: string;
    courseId: string;
    studentId: string;
    mentorId: string;
    studentComment: string;
    mentorComment: string;
    score: number;
    assignmentRepo: string;
    deadlineDate: string;
    completeDate: string;
    checkDate: string;
    status: AssignmentStatus;
}

export interface IAssignmentModel extends Document, IAssignment {
    _id: string;
}

export const AssignmentSchema: Schema = new Schema({
    assignmentRepo: String,
    checkDate: String,
    completeDate: String,
    courseId: String,
    deadlineDate: String,
    mentorComment: String,
    mentorId: String,
    score: Number,
    status: String,
    studentComment: String,
    studentId: String,
    taskId: String,
});

const AssignmentModelName = 'Assignment';
export const AssignmentModel = model<IAssignmentModel>(AssignmentModelName, AssignmentSchema);
