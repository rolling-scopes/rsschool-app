import { Document, Schema, model } from 'mongoose';

export enum AssignmentStatus {
    Assigned = 'Assigned',
    ReadyForReview = 'ReadyForReview',
    Rejected = 'Rejected',
    Checked = 'Checked',
}

export enum WhoChecks {
    Mentor = 'Mentor',
    RandomMentor = 'Random Mentor',
    Trainer = 'Trainer',
    UnitTest = 'Unit Test',
    ExternalPerson = 'External Person',
    WithoutChecking = 'Without Checking',
    Codewars = 'Codewars',
    Codecademy = 'Codecademy',
    Duolingo = 'Duolingo',
}

export interface IAssignment {
    assignmentRepo?: string;
    checkDate?: number;
    completeDate?: number;
    courseId: string;
    deadlineDate: number;
    mentorComment?: string;
    mentorId?: string;
    score?: number;
    startDateTime: number;
    status: AssignmentStatus;
    studentComment?: string;
    studentId: string;
    taskId: string;
    title?: string;
    urlToDescription?: string;
    whoChecks?: WhoChecks;
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
    startDateTime: Number,
    status: String,
    studentComment: String,
    studentId: String,
    taskId: String,
    title: String,
    urlToDescription: String,
    whoChecks: String,
});

export const AssignmentModelName = 'Assignment';
export const AssignmentModel = model<IAssignmentModel>(AssignmentModelName, AssignmentSchema);
