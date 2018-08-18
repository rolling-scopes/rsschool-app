import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import {
    IApiResponse,
    AssignmentModel,
    IAssignmentModel,
    IUserSession,
    IEventModel,
    TaskModel,
    AssignmentStatus,
} from '../../models';
export const courseAssignmentsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        const { id: courseId } = ctx.params;
        const studentId: string = userSession._id;
        const assignments: IAssignmentModel[] = await getAssignmentsByCourseIdAndUserId(courseId, studentId);
        const arrayOfTasksId: string[] = [];
        for (const index in assignments) {
            if (assignments[index]) {
                arrayOfTasksId.push(assignments[index].taskId);
            }
        }
        const tasks: IEventModel[] = await getTasksByTaskId(arrayOfTasksId);
        const tasksForCombine: any = tasks;
        const combinedAssignments: any = assignments;
        for (const index in combinedAssignments) {
            if (combinedAssignments[index] && tasksForCombine[index]) {
                combinedAssignments[index]._doc = {
                    ...tasksForCombine[index]._doc,
                    ...combinedAssignments[index]._doc,
                };
            }
        }
        const result: NormalizeAssignmentsData = getNormalizeAssignmentsData(combinedAssignments);
        const body: IApiResponse<NormalizeAssignmentsData> = {
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

export const getNormalizeAssignmentsData = (assignments: IAssignmentModel[]): NormalizeAssignmentsData => {
    const sortedAssignments = assignments
        .reduce<INormalizeAssignments[]>((res, assignment) => {
            if (assignment.deadlineDate < Date.now() && assignment.status === AssignmentStatus.Assigned) {
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
    const data = sortedAssignments.reduce<NormalizeAssignmentsData>(
        (prev, next) => {
            prev.assignments.push(next);
            return prev;
        },
        { assignments: [] },
    );
    return data;
};

const getAssignmentsByCourseIdAndUserId = (courseId: string, studentId: string) => {
    return AssignmentModel.find({ courseId, studentId }).exec();
};

const getTasksByTaskId = (arrayOfTasksId: string[]) => {
    return TaskModel.find({ _id: arrayOfTasksId }).exec();
};
