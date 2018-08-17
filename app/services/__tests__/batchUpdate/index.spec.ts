import { App } from '../../../index';
import {
    parseXLSXTable,
    checkForStudentsDuplications,
    checkMentorsForExisting,
    checkStudentsForExisting,
    checkForFloatingScore,
    checkJSCOREInterviewTable,
} from '../../batchUpdate';

let server: any;
let app: any;
let cellPositions = {};

describe('table parser', () => {
    it('should return correct columns', () => {
        const tableData = [['one', 'two', 'three'], ['1', '2', '3']];
        const parsedData = parseXLSXTable(`${__dirname}/data/test-table.xlsx`);

        expect(parsedData).toEqual(tableData);
    });
});

describe('table correctness checker', async () => {
    beforeAll(async () => {
        app = new App();
        server = app.start();
        await app.connect();

        cellPositions = {
            mentorColumn: 1,
            scoreColumn: 2,
            studentColumn: 0,
        };
    });
    afterAll(async () => {
        await app.disconnect();
        await server.close();
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
        const errors = await checkJSCOREInterviewTable(
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
