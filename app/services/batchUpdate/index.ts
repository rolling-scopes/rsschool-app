import { WorkBook, readFile, utils } from 'xlsx';

// tmp; replace when will be added 'officially'
export enum AssignmentsType {
    studentId = 'studentId',
    mentorId = 'mentorId',
    score = 'score',
    mentorComment = 'mentorComment',
    checkDate = 'checkDate',
}

export * from './checkData';
export * from './makeAssignments';

export function parseXLSXTable(path: string): Array<Array<string>> {
    const table: WorkBook = readFile(path);
    const firstList: number = 0;
    const name: string = table.SheetNames[firstList];

    return utils.sheet_to_json(table.Sheets[name], { header: 1 });
}
