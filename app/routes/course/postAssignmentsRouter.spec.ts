import mockingoose from 'mockingoose';
import { postAssignments } from './postAssignmentsRouter';
import { STATES, connection } from 'mongoose';

describe('./getAssignmentsRouter.ts', () => {
    it('returns data', async () => {
        const ctx = {
            request: {
                body: {
                    idTask: '5b89b16999fa45417c962ae6',
                    idUser: 'apalchys',
                    link: 'https://github.com/',
                    studentComment: 'studentComment',
                },
            },
            state: {
                user: {
                    _id: 'apalchys',
                },
            },
        } as any;
        mockingoose.assignments.toReturn([
            {
                assigmentRepo: 'https://github.com/',
                checkDate: 222,
                completeDate: 730260000,
                courseId: 'rs-course-2018-2',
                deadlineDate: 1537642920000.0,
                mentorComment: '',
                mentorId: '',
                score: 20,
                status: 'Assigned',
                studentComment: '',
                studentId: 'apalchys',
                taskId: '5b89b16999fa45417c962ae6',
                title: 'titleTask',
            },
        ]);
        connection.readyState = STATES.connected;
        await postAssignments(ctx);
        expect(ctx.status).toBe(200);
    });
});
