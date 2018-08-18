import * as moment from 'moment';

import { AssignmentsType } from './';

export function getMentorCommentsColumns(needColumns: any): any {
    return Object.keys(needColumns).reduce(
        (mentorCommentsColumns: any, column: any) => {
            if (needColumns[column].assignmentsField !== AssignmentsType.mentorComment) {
                const { [column]: _, ...rest } = mentorCommentsColumns;
                return { ...rest };
            }
            return mentorCommentsColumns;
        },
        { ...needColumns },
    );
}

export function mergeMentorComments(taskResult: Array<string>, mentorComments: any): string {
    return Object.keys(mentorComments).reduce((mergedMentorComments: string, column: any): string => {
        const commentValue = taskResult[column];
        const comment = `### ${mentorComments[column].tableColumn}\n${commentValue}\n\n`;

        return mergedMentorComments + comment;
    }, '');
}

function setField(field: any, value: any) {
    switch (field) {
        case AssignmentsType.studentId:
        case AssignmentsType.mentorId:
        case AssignmentsType.score: {
            return { [field]: value };
        }
        case AssignmentsType.checkDate: {
            return { [field]: moment(value, 'MM/DD/YYYY HH:mm:ss').valueOf() };
        }
        case AssignmentsType.mentorComment: {
            return { [field]: true };
        }
    }
}
export function makeAssignment(courseId: string, taskId: string, taskResult: Array<string>, needColumns: any): any {
    const entry = Object.keys(needColumns).reduce(
        (assignment: any, column: any) => ({
            ...assignment,
            ...setField(needColumns[column].assignmentsField, taskResult[column].trim()),
        }),
        { courseId, taskId },
    );
    if (entry[AssignmentsType.mentorComment]) {
        entry[AssignmentsType.mentorComment] = mergeMentorComments(taskResult, getMentorCommentsColumns(needColumns));
    }
    return entry;
}

export function makeAssignments(results: any, courseId: string, taskId: string, needColumns: any): any {
    return results.map((result: any): any => makeAssignment(courseId, taskId, result, needColumns));
}
