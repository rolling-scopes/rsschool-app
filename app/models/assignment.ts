import { Document, Schema, model } from 'mongoose';

export enum AssignmentStatus {
    Assigned = 'Assigned',
    ReadyForReview = 'ReadyForReview',
    Rejected = 'Rejected',
    Checked = 'Checked',
}

export interface IGeneratedAssignment {
    courseId: string;
    deadlineDate: Date;
    taskId: string;
    mentorId: string;
    status: AssignmentStatus;
    studentId: string;
}

export interface IAssignment extends IGeneratedAssignment {
    studentComment: number;
    mentorComment: string;
    score: number;
    assignmentRepo: string;
    completeDate: Date;
    checkDate: Date;
}

export interface IAssignmentModel extends Document, IAssignment {
    _id: Schema.Types.ObjectId;
}

export const AssignmentSchema: Schema = new Schema({
    assignmentRepo: { type: String, required: false, default: '' },
    checkDate: { type: Date, required: false, default: '' },
    completeDate: { type: Date, required: false, default: '' },
    courseId: String,
    deadlineDate: { type: Date, required: false, default: '' },
    mentorComment: { type: String, required: false, default: '' },
    mentorId: String,
    score: { type: Number, required: false, default: '' },
    status: String,
    studentComment: { type: String, required: false, default: '' },
    studentId: String,
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
});

export const AssignmentModelName = 'Assignment';
export const AssignmentModel = model<IAssignmentModel>(AssignmentModelName, AssignmentSchema);
