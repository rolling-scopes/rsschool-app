import { IAssignment } from './../models/assignment';
import { AssignmentModel } from '../models';

export async function batchUpdate(
    forSave: IAssignment[],
    matchingFields: string[] = ['courseId', 'taskId', 'studentId'],
) {
    return AssignmentModel.bulkUpdate(forSave, matchingFields);
}
