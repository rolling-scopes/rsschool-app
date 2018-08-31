import { IRouterContext } from 'koa-router';
import { AssignmentStatus } from '../../models';
import { OK } from 'http-status-codes';
import { setResponse } from '../utils';

const getMockAssignments = jest.fn(() => {
    return [
        {
            _id: 'string',
            assignmentRepo: 'string',
            checkDate: 123,
            completeDate: 123,
            courseId: 'string',
            deadlineDate: 123,
            mentorComment: 'string',
            mentorId: 'string',
            score: 123,
            status: AssignmentStatus.Assigned,
            studentComment: 'string',
            studentId: 'string',
            taskId: 'string',
        },
    ];
});

describe('app/routes/course/assignments.ts', () => {
    it('returns data', async () => {
        const ctx = createTestContext();
        const assignments = await getMockAssignments();
        const arrayOfTasksId: string[] = [];
        for (const index in assignments) {
            if (assignments[index]) {
                arrayOfTasksId.push(assignments[index].taskId);
            }
        }
        expect(getMockAssignments).toHaveBeenCalledTimes(1);
        setResponse(ctx, OK, ctx.body);
        expect(ctx.body).toMatchSnapshot();
        expect(ctx.status).toBe(200);
    });
});

export function createTestContext(): IRouterContext {
    return {
        body: {
            assignmentRepo: 'repo',
            checkDate: 123,
            completeDate: 123,
            courseId: 'String',
            deadlineDate: 123,
            mentorComment: 'String',
            mentorId: 'String',
            score: 0,
            status: 'Assigned',
            studentComment: 'String',
            studentId: 'String',
            taskId: 'String',
        },
    } as any;
}
