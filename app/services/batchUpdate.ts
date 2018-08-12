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

            const isMentor = await isUserIsMentor(mentorName.trim());

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

export function makeAssignmentsForJSCoreInterview(
    table: any,
    needColumnsForSave: any,
    courseIdentifier: string,
    taskIdentifier: string,
) {
    interface INeedColumns {
        [key: string]: number;
    }
    interface IAssignment {
        courseId: string;
        taskId: string;
        date: string;
        studentId: string;
        mentorId: string;
        score?: number;
        mentorComment?: string;
    }

    function findNeedColumnsPositionInTable(tableColumns: Array<string>, needColumns: Array<string>): INeedColumns {
        return needColumns.reduce((needColumnsPositionsInTable: any, needColumn: any) => {
            const needColumnPositionInTableColumns = tableColumns.indexOf(needColumn);
            if (needColumnPositionInTableColumns !== -1) {
                needColumnsPositionsInTable[needColumn] = needColumnPositionInTableColumns;
            }
            return needColumnsPositionsInTable;
        }, {});
    }

    function findNeedMentorCommentsColumnsInTable(
        needTableColumns: INeedColumns,
        mentorCommentsColumns: Array<string>,
    ): INeedColumns {
        return mentorCommentsColumns.reduce((needMentorCommentsColumns: any, mentorCommentColumn: any) => {
            if (needTableColumns.hasOwnProperty(mentorCommentColumn)) {
                needMentorCommentsColumns[mentorCommentColumn] = needTableColumns[mentorCommentColumn];
            }
            return needMentorCommentsColumns;
        }, {});
    }

    function mergeMentorComments(interviewResult: Array<string>, needMentorComments: INeedColumns): string {
        return Object.keys(needMentorComments).reduce((mergedMentorComments: string, taskName: string): string => {
            const commentValue = interviewResult[needMentorComments[taskName]];
            const comment = `### ${taskName}\n${commentValue}\n\n`;
            return mergedMentorComments + comment;
        }, '');
    }

    function makeAssignment(
        courseId: string,
        taskId: string,
        interviewResult: Array<string>,
        needColumns: INeedColumns,
        mentorCommentsFields: Array<string>,
    ): IAssignment {
        return {
            courseId,
            date: interviewResult[needColumns[time]],
            mentorComment: mergeMentorComments(
                interviewResult,
                findNeedMentorCommentsColumnsInTable(needColumns, mentorCommentsFields),
            ),
            mentorId: interviewResult[needColumns[mentorGitHub]],
            score: parseInt(interviewResult[needColumns[score]], 10),
            studentId: interviewResult[needColumns[studentGithub]],
            taskId,
        } as IAssignment;
    }

    function makeAssignments(
        interviewResults: Array<string>,
        courseId: string,
        taskId: string,
        needColumns: INeedColumns,
        mentorCommentsFields: Array<string>,
    ): Array<IAssignment> {
        return interviewResults.map(
            (interviewResult: any): IAssignment => {
                return makeAssignment(courseId, taskId, interviewResult, needColumns, mentorCommentsFields);
            },
        );
    }

    const tableColumnsHeaders = table[0].map((h: string) => h.trim());
    const taskResults = table.slice(1);

    const time = 'Time';
    const studentGithub = 'GitHub Студента';
    const mentorGitHub = 'GitHub Ментора';
    const score = 'Общая оценка';

    const context = 'Знание this/apply/call/bind';
    const dom = 'Знание DOM/DOM Events';
    const scope = 'Знание Scope/Closures';
    const inheritance = 'Знание наследования и классов';
    const bookmarks = 'Заметки';
    const mentorComments = [context, dom, scope, inheritance, bookmarks];

    const assignments = makeAssignments(
        taskResults,
        courseIdentifier,
        taskIdentifier,
        findNeedColumnsPositionInTable(tableColumnsHeaders, needColumnsForSave),
        mentorComments,
    );

    // console.log(assignments[0]);
    return assignments;
}
