import mockingoose from 'mockingoose';
import { createTestContext } from '../../utils';
import { getAssignments } from './getAssignmentsRouter';
import { STATES, connection } from 'mongoose';

describe('./getAssignmentsRouter.ts', () => {
    it('returns data', async () => {
        const ctx = createTestContext();
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
        await getAssignments(ctx);
        expect(ctx.status).toBe(200);
        const dateForSnapshot = {
            assigmentRepo: ctx.body.data[0].assigmentRepo,
            checkDate: ctx.body.data[0].checkDate,
            completeDate: ctx.body.data[0].completeDate,
            courseId: ctx.body.data[0].courseId,
            deadlineDate: ctx.body.data[0].deadlineDate,
            mentorComment: ctx.body.data[0].mentorComment,
            mentorId: ctx.body.data[0].mentorId,
            score: ctx.body.data[0].score,
            status: ctx.body.data[0].status,
            studentComment: ctx.body.data[0].studentComment,
            studentId: ctx.body.data[0].studentId,
            taskId: ctx.body.data[0].taskId,
            title: ctx.body.data[0].title,
        };
        expect(dateForSnapshot).toMatchSnapshot();
    });
});
