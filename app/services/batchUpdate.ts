import { WorkBook, readFile, utils } from 'xlsx';

import { isUserExists, isUserIsMentor } from '../services/userService';

export enum JSCOREInterviewColumns {
    time = 'Time',
    studentId = 'GitHub Студента',
    mentorId = 'GitHub Ментора',
    score = 'Общая оценка',
    context = 'Знание this/apply/call/bind',
    dom = 'Знание DOM/DOM Events',
    scope = 'Знание Scope/Closures',
    inheritance = 'Знание наследования и классов',
    bookmarks = 'Заметки',
}

// TODO: rename to getTableColumns
export function parseXLSXTable(path: string): Array<any> {
    const table: WorkBook = readFile(path);
    const firstList: number = 0;
    const name: string = table.SheetNames[firstList];

    return utils.sheet_to_json(table.Sheets[name], { header: 1 });
}

export function checkForStudentsDuplications({ studentColumn }: any) {
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

export function checkStudentsForExisting({ studentColumn }: any) {
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

export function checkMentorsForExisting({ mentorColumn }: any) {
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

export function checkForFloatingScore({ studentColumn, scoreColumn }: any) {
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
// @ts-ignore
export async function checkJSCOREInterviewTable([tableHeaders, ...taskResults]: any, checkers: any) {
    const allErrors = checkers.reduce(async (errors: any, fn: any) => {
        return Promise.resolve([...(await Promise.resolve(errors)), ...(await fn(taskResults))]);
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
            date: interviewResult[needColumns[JSCOREInterviewColumns.time]],
            mentorComment: mergeMentorComments(
                interviewResult,
                findNeedMentorCommentsColumnsInTable(needColumns, mentorCommentsFields),
            ),
            mentorId: interviewResult[needColumns[JSCOREInterviewColumns.mentorId]].trim(),
            score: parseInt(interviewResult[needColumns[JSCOREInterviewColumns.score]].trim(), 10),
            studentId: interviewResult[needColumns[JSCOREInterviewColumns.studentId]].trim(),
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

    const mentorComments = [
        JSCOREInterviewColumns.context,
        JSCOREInterviewColumns.dom,
        JSCOREInterviewColumns.scope,
        JSCOREInterviewColumns.inheritance,
        JSCOREInterviewColumns.bookmarks,
    ];

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
