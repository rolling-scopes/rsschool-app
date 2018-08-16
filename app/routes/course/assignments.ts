import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { IApiResponse, AssignmentModel, IAssignmentModel, IUserSession, IEventModel, TaskModel } from '../../models';
export const courseAssignmentsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        const { id: courseId } = ctx.params;
        let studentId: string = userSession._id;
        studentId = 'brody.moen19';

        const assignments: IAssignmentModel[] = await AssignmentModel.find({ courseId, studentId }).exec();
        const arrayOfTasksId: string[] = [];
        for (const index in assignments) {
            if (assignments[index]) {
                arrayOfTasksId.push(assignments[index].taskId);
            }
        }
        const tasks: IEventModel[] = await TaskModel.find({ _id: arrayOfTasksId }).exec();
        const tasksForCombine: any = tasks;
        const combinedAssignments: any = assignments;

        for (const index in combinedAssignments) {
            if (combinedAssignments[index] && tasksForCombine[index]) {
                combinedAssignments[index]._doc = {
                    ...combinedAssignments[index]._doc,
                    ...tasksForCombine[index]._doc,
                };
            }
        }
        const result: any = getNormalizeAssignmentsData(combinedAssignments);
        const body: IApiResponse<IAssignmentModel> = {
            data: result,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};

type INormalizeAssignments = {
    isEndAssignment: boolean;
    assignment: IAssignmentModel;
};

type NormalizeAssignmentsData = {
    assignments: INormalizeAssignments[];
};

export const getNormalizeAssignmentsData = (assignments: IAssignmentModel[]): NormalizeAssignmentsData[] => {
    const sortedAssignments = assignments
        .reduce<INormalizeAssignments[]>((res, assignment) => {
            if (assignment.deadlineDate < Date.now() && assignment.score === null) {
                res.push({ assignment, isEndAssignment: true });
            } else {
                res.push({ assignment, isEndAssignment: false });
            }
            return res;
        }, [])
        .sort((assignmentA, assignmentB) => {
            const a = assignmentA.assignment.deadlineDate!;
            const b = assignmentB.assignment.deadlineDate!;
            return b - a;
        });
    const initialData = sortedAssignments.reduce<NormalizeAssignmentsData[]>(
        res => {
            return res;
        },
        [{ assignments: [] }],
    );
    const data = sortedAssignments.reduce<NormalizeAssignmentsData[]>((res, normalizeAssignment) => {
        for (const item of res) {
            if (item) {
                item.assignments.push(normalizeAssignment);
            }
        }
        return res;
    }, initialData);
    return data;
};
