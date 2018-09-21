import { Document, Schema, Model, model } from 'mongoose';

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

interface IAssignmentModelStatic extends Model<IAssignmentModel> {
    bulkUpdate(assignments: IAssignment[], fieldsForUpdate: string[]): any;
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

AssignmentSchema.statics.bulkUpdate = function bulkUpdate(assignments: IAssignment[], queryFields: string[]) {
    const bulk = this.collection.initializeOrderedBulkOp();

    assignments.forEach(assignment => {
        const query = queryFields.reduce(
            (partialQuery, assignmentField) => ({
                ...partialQuery,
                // @ts-ignore
                [assignmentField]: assignment[assignmentField],
            }),
            {},
        );

        bulk.find(query).updateOne({ $set: assignment });
    });

    return bulk.execute();
};

export const AssignmentModelName = 'Assignment';
export const AssignmentModel = model<IAssignmentModel, IAssignmentModelStatic>(AssignmentModelName, AssignmentSchema);
