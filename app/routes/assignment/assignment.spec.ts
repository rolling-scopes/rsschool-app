import { IRouterContext } from 'koa-router';
import { AssignmentStatus } from '../../models';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { setResponse } from '../utils';

const createPatchAssignmentRoute = async (ctx: any, next: any) => {
    ctx.body.status = AssignmentStatus.Checked;
    ctx.body.score = 100;
    await next();
};

describe('app/routes/assignment/assignment.ts', () => {
    it('returns 200 if returns data', async () => {
        const ctx = createTestContext();
        const findByIdAndUpdate = jest.fn(() => {
            expect(ctx.body).toEqual(
                expect.objectContaining({
                    score: expect.any(Number),
                    status: expect.stringMatching('Checked'),
                }),
            );
        });
        await createPatchAssignmentRoute(ctx, findByIdAndUpdate);
        expect(findByIdAndUpdate).toHaveBeenCalledTimes(1);
        setResponse(ctx, OK, ctx.body);
        expect(ctx.status).toBe(200);
    });

    it('returns 500 if internal server error', async () => {
        const ctx = createTestContext();
        const findByIdAndUpdate = jest.fn(() => {
            expect(ctx.body).toEqual(
                expect.objectContaining({
                    score: expect.any(Number),
                    status: expect.stringMatching('Checked'),
                }),
            );
        });
        await createPatchAssignmentRoute(ctx, findByIdAndUpdate);
        expect(findByIdAndUpdate).toHaveBeenCalledTimes(1);
        ctx.status = INTERNAL_SERVER_ERROR;
        expect(ctx.status).toBe(500);
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
