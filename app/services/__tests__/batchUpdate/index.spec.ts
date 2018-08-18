import { App } from '../../../index';
import {
    parseXLSXTable,
    // table checking
    checkForStudentsDuplications,
    checkMentorsForExisting,
    checkStudentsForExisting,
    checkForFloatingScore,
    checkTable,
    // assignments
    getMentorCommentsColumns,
    mergeMentorComments,
    makeAssignment,
    makeAssignments,
    AssignmentsType,
    getVerifiableData,
} from '../../batchUpdate';

let server: any;
let app: any;

describe('table parser', () => {
    it('should return correct columns', () => {
        const tableData = [['one', 'two', 'three'], ['1', '2', '3']];
        const parsedData = parseXLSXTable(`${__dirname}/data/test-table.xlsx`);

        expect(parsedData).toEqual(tableData);
    });
});

const columns = {
    0: { assignmentsField: AssignmentsType.studentId },
    1: { assignmentsField: AssignmentsType.mentorId },
    2: { assignmentsField: AssignmentsType.score },
};
const cellPositions = getVerifiableData(columns);

describe('table correctness checker', async () => {
    beforeAll(async () => {
        app = new App();
        server = app.start();
        await app.connect();
    });
    // afterEach(async () => {
    //     await app.disconnect();
    //     server.close();
    // });
    afterAll(async () => {
        await app.disconnect();
        server.close();
    });

    it('checks for students duplications', () => {
        const table = [['ted70'], ['ted70']];
        const errors = checkForStudentsDuplications(cellPositions)(table);
        expect(errors).toHaveLength(1);
    });
    it('checks for student existing', async () => {
        const table = [['ted70'], ['kakoc']];

        const errors = await checkStudentsForExisting(cellPositions)(table);
        expect(errors).toHaveLength(1);
    });
    it('checks for mentor existing', async () => {
        const table = [['_', 'eddie79'], ['_', 'kakoc']];
        const errors = await checkMentorsForExisting(cellPositions)(table);

        expect(errors).toHaveLength(1);
    });
    it('checks cells for floating score', () => {
        const table = [['student', 'mentor', '5'], ['student', 'mentor', '5.5']];
        const errors = checkForFloatingScore(cellPositions)(table);

        expect(errors).toHaveLength(1);
    });

    // used combined checker
    it('checks for all errors using complex checker', async () => {
        // [student, mentor, score]
        const table = [
            ['studentId', 'mentorId', 'score'],
            ['ted70', 'eddie79', '228'],
            ['notStudent', 'notMentor', '1.111'],
            ['ted70', 'eddie79', '228'],
        ];
        const errors = await checkTable(
            table,
            [
                checkForStudentsDuplications,
                checkStudentsForExisting,
                checkMentorsForExisting,
                checkForFloatingScore,
            ].map((fn: any) => fn(cellPositions)),
        );

        expect(errors).toHaveLength(4);
    });
});

describe('make assignments', () => {
    it('retrieves mentorComments columns', () => {
        const needColumns = {
            0: {
                assignmentsField: 'mentorComment',
            },
            1: {
                assignmentsField: 'mentorComment',
            },
            2: {
                assignmentsField: 'mentorId',
            },
            3: {
                assignmentsField: 'studentId',
            },
        };

        expect(getMentorCommentsColumns(needColumns)).toEqual({
            0: { assignmentsField: 'mentorComment' },
            1: {
                assignmentsField: 'mentorComment',
            },
        });
    });
    it('should merge mentor comments', () => {
        const taskResult = ['first', 'second', 'third'];
        const mentorComments = {
            1: { tableColumn: 'Student GitHub' },
            2: { tableColumn: 'Score' },
        };

        expect(mergeMentorComments(taskResult, mentorComments)).toEqual(
            `### Student GitHub\nsecond\n\n### Score\nthird\n\n`,
        );
    });
    it('should make assignments object', () => {
        const taskResult = ['first', 'second', 'third'];
        const needColumns = {
            1: { tableColumn: 'Student GitHub', assignmentsField: 'studentId' },
            2: { tableColumn: 'Mentor GitHub', assignmentsField: 'mentorId' },
        };
        const courseId = 'foo';
        const taskId = 'bar';

        expect(makeAssignment(courseId, taskId, taskResult, needColumns)).toEqual({
            courseId,
            mentorId: 'third',
            studentId: 'second',
            taskId,
        });
    });
    it('should make array of assignments', () => {
        const results = [['first', 'second', 'third'], ['one', 'two', 'three']];
        const needColumns = {
            1: { tableColumn: 'Student GitHub', assignmentsField: 'studentId' },
            2: { tableColumn: 'Mentor GitHub', assignmentsField: 'mentorId' },
        };
        const courseId = 'foo';
        const taskId = 'bar';

        expect(makeAssignments(results, courseId, taskId, needColumns)).toEqual([
            {
                courseId,
                mentorId: 'third',
                studentId: 'second',
                taskId,
            },
            {
                courseId,
                mentorId: 'three',
                studentId: 'two',
                taskId,
            },
        ]);
    });
});
