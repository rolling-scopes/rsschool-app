import { WorkBook, readFile, utils } from 'xlsx';

import { isUserExists, isUserIsMentor } from '../services/userService';

export enum AssignmentsType {
    studentId = 'studentId',
    mentorId = 'mentorId',
    score = 'score',
    mentorComment = 'mentorComment',
    checkDate = 'checkDate',
}

export const defaultRequirenmentsForAssignments = [
    AssignmentsType.studentId,
    AssignmentsType.mentorId,
    AssignmentsType.score,
    AssignmentsType.checkDate,
];
// interface INeedColumns {
//     [key: string]: number;
// }

// interface IAssignment {
//     courseId: string;
//     taskId: string;
//     checkDate: string;
//     studentId: string;
//     mentorId: string;
//     score: number;
//     mentorComment?: string;
// }
// TODO: rename to getTableColumns
export function parseXLSXTable(path: string): Array<any> {
    const table: WorkBook = readFile(path);
    const firstList: number = 0;
    const name: string = table.SheetNames[firstList];

    return utils.sheet_to_json(table.Sheets[name], { header: 1 });
}

export function checkForStudentsDuplications({ [AssignmentsType.studentId]: studentColumn }: any) {
    return (taskResults: Array<any>) => {
        const errors: Array<string> = [];

        const userDuplications: any = {};
        taskResults.forEach((result: any) => {
            const student = result[studentColumn];

            if (!userDuplications.hasOwnProperty(student)) {
                userDuplications[student] = 1;
            } else if (userDuplications.hasOwnProperty(student)) {
                userDuplications[student] += 1;
            }
        });

        for (const student of Object.keys(userDuplications)) {
            if (userDuplications[student] > 1) {
                errors.push(`STUDENT ${student} IS DUPLICATED IN SCORE TABLE`);
            }
        }

        return errors;
    };
}

export function checkStudentsForExisting({ [AssignmentsType.studentId]: studentColumn }: any) {
    return async (taskResults: Array<any>) => {
        const errors = [];

        for (const task of taskResults) {
            const student = task[studentColumn];
            const isStudentExists = await isUserExists(student);

            if (!isStudentExists) {
                errors.push(`STUDENT ${student} DOES NOT EXIST`);
            }
        }

        return errors;
    };
}

export function checkMentorsForExisting({ [AssignmentsType.mentorId]: mentorColumn }: any) {
    return async (taskResults: Array<any>) => {
        const errors = [];

        for (const task of taskResults) {
            const mentorName = task[mentorColumn];
            // console.log('here', mentorColumn);
            const isMentor = await isUserIsMentor(mentorName.trim());

            if (!isMentor) {
                errors.push(`MENTOR ${mentorName} DOES NOT EXIST`);
            }
        }

        return errors;
    };
}

export function checkForFloatingScore({
    [AssignmentsType.studentId]: studentColumn,
    [AssignmentsType.score]: scoreColumn,
}: any) {
    return (taskResults: Array<any>) => {
        const errors: Array<string> = [];

        taskResults.forEach((result: any) => {
            const student = result[studentColumn];
            const score = result[scoreColumn];

            if (!Number.isInteger(parseFloat(score))) {
                errors.push(`SCORE FOR ${student} WITH FLOAT POINT`);
            }
        });

        return errors;
    };
}

// TODO columns, checkers
export function getVerifiableData(columns: any) {
    return Object.keys(columns).reduce((checkingData: any, column: any) => {
        return { ...checkingData, [columns[column].assignmentsField]: column };
    }, {});
}

export function isAllNeedData(data: any, needFields: any) {
    const fields = Object.keys(data).map((k: any) => data[k].assignmentsField);
    return needFields.filter((f: any) => !fields.includes(f)).length === 0;
}

export function prepareCheckers(needData: any) {
    return (checkers: any) => {
        return checkers.map((checker: any) => checker(needData));
    };
}
const compose = (...funcs: Array<any>) =>
    funcs.reduce((a: any, b: any) => (...args: Array<any>) => a(b(...args)), (arg: any) => arg);

export const prepareForChecking = compose(
    prepareCheckers,
    getVerifiableData,
);
export const baseCheckers = [
    checkForStudentsDuplications,
    checkStudentsForExisting,
    checkMentorsForExisting,
    checkForFloatingScore,
];
// @ts-ignore
export async function checkTable([tableHeaders, ...taskResults]: any, checkers: any) {
    const allErrors = checkers.reduce(async (errors: any, fn: any) => {
        return Promise.resolve([...(await Promise.resolve(errors)), ...(await fn(taskResults))]);
    }, Promise.resolve([]));

    return allErrors;
}

// --------------------- Make Assignments -----------------------

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
        case AssignmentsType.score:
        case AssignmentsType.checkDate: {
            return { [field]: value };
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
    return results.map(
        (result: any): any => {
            return makeAssignment(courseId, taskId, result, needColumns);
        },
    );
}
