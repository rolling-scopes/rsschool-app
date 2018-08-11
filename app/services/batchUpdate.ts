import { WorkBook, readFile, utils } from 'xlsx';

import { isUserExists, isUserIsMentor } from '../services/userService';

export function parseXLSXTable(path: string): Array<any> {
    const table: WorkBook = readFile(path);
    const name: string = table.SheetNames[0];

    return utils.sheet_to_json(table.Sheets[name], { header: 1 });
}

export async function checkJSCOREInterviewTable(table: any) {
    function checkForStudentsDuplications(taskResults: Array<any>) {
        const errors: Array<string> = [];

        const userDuplications: any = {};
        taskResults.forEach((result: any) => {
            const student = result[1];

            if (!userDuplications.hasOwnProperty(student)) {
                userDuplications[student] = 1;
            } else if (userDuplications.hasOwnProperty(student)) {
                userDuplications[student] += 1;
            }
        });

        for (const student in userDuplications) {
            if (userDuplications[student] > 1) {
                errors.push(`STUDENT ${student} IS DUPLICATED IN SCORE TABLE`);
            }
        }

        return errors;
    }

    async function checkStudentsForExisting(taskResults: Array<any>) {
        const errors = [];

        for (const task of taskResults) {
            const student = task[1];
            const isStudentExists = await isUserExists(student);
            if (!isStudentExists) {
                errors.push(`STUDENT ${student} DOES NOT EXIST`);
            }
        }

        return errors;
    }

    async function checkMentorsForExisting(taskResults: Array<any>) {
        const errors = [];

        for (const task of taskResults) {
            const mentorName = task[2];

            const isMentor = await isUserIsMentor(mentorName);

            if (!isMentor) {
                errors.push(`MENTOR ${mentorName} DOES NOT EXIST`);
            }
        }

        return errors;
    }

    function checkForFloatingScore(taskResults: Array<any>) {
        const errors: Array<string> = [];

        taskResults.forEach((result: any) => {
            const student = result[1];
            const score = result[7];

            if (!Number.isInteger(parseFloat(score))) {
                errors.push(`SCORE FOR ${student} WITH FLOAT POINT`);
            }
        });

        return errors;
    }

    const interviewResults = table.slice(1);
    const allErrors = [
        checkForStudentsDuplications,
        checkStudentsForExisting,
        checkMentorsForExisting,
        checkForFloatingScore,
    ].reduce(async (errors: any, fn: any) => {
        return Promise.resolve([...(await Promise.resolve(errors)), ...(await fn(interviewResults))]);
    }, Promise.resolve([]));

    return allErrors;
}
