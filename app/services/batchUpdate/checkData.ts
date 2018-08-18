import { compose } from '../../utils';
import { isUserExists, isUserIsMentor } from '../../services/userService';
import { AssignmentsType } from './index';

export const defaultRequirementsForSaving = [
    AssignmentsType.studentId,
    AssignmentsType.mentorId,
    AssignmentsType.score,
    AssignmentsType.checkDate,
];

export const baseCheckers = [
    checkForStudentsDuplications,
    checkStudentsForExisting,
    checkMentorsForExisting,
    checkForFloatingScore,
];

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

export function getVerifiableData(columns: any) {
    return Object.keys(columns).reduce((checkingData: any, column: any) => {
        return { ...checkingData, [columns[column].assignmentsField]: column };
    }, {});
}

export function isAllNeedData(data: any, needFields: any) {
    const fields = Object.keys(data).map((k: any) => data[k].assignmentsField);
    return needFields.filter((f: any) => !fields.includes(f)).length === 0;
}

function prepareCheckers(needData: any) {
    return (checkers: any) => {
        return checkers.map((checker: any) => checker(needData));
    };
}

export const prepareForChecking = compose(
    prepareCheckers,
    getVerifiableData,
);

// @ts-ignore
export async function checkTable([tableHeaders, ...taskResults]: any, checkers: any) {
    const allErrors = checkers.reduce(async (errors: any, fn: any) => {
        return Promise.resolve([...(await Promise.resolve(errors)), ...(await fn(taskResults))]);
    }, Promise.resolve([]));

    return allErrors;
}
