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
import * as _ from 'lodash';

type AssignmentResponse = {
    _id: string;
    assignmentRepo?: string;
    author?: string;
    checkDate?: number;
    completeDate?: number;
    courseId: string;
    deadlineDate: number;
    endDateTime?: number;
    mentorComment?: string;
    mentorId?: string;
    score: number;
    startDateTime: number;
    status: string;
    studentComment?: string;
    studentId: string;
    taskId: string;
    taskType?: string;
    title: string;
    type: string;
    urlToDescription?: string;
    whoChecks?: string;
};

type INormalizeAssignments = {
    isEndAssignment: boolean;
    isActiveAssignment: boolean;
    assignment: AssignmentResponse;
};

type NormalizeAssignmentsData = {
    assignments: INormalizeAssignments[];
};

export const courseAssignmentsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        const { id: courseId } = ctx.params;
        const studentId: string = userSession._id;
        const assignments: IAssignmentModel[] = await getAssignmentsByCourseIdAndUserId(courseId, studentId);
        const arrayOfTasksId: string[] = assignments.map(assignment => assignment.taskId);
        const tasks: IEventModel[] = await getTasksByTaskId(arrayOfTasksId);
        const combinedAssignmentsAndTasks: AssignmentResponse[] = [];
        for (const index in assignments) {
            if (assignments[index] && tasks[index]) {
                combinedAssignmentsAndTasks[index] = { ...Object.create(null), ...tasks[index], ...assignments[index] };
            }
        }
        const result: NormalizeAssignmentsData = getNormalizeAssignmentsData(combinedAssignmentsAndTasks);
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

export const getNormalizeAssignmentsData = (assignments: AssignmentResponse[]): NormalizeAssignmentsData => {
    const refactoredAssignments: INormalizeAssignments[] = assignments.map(assignment => {
        if (assignment.deadlineDate < Date.now() && assignment.status === AssignmentStatus.Assigned) {
            return { assignment, isEndAssignment: true, isActiveAssignment: true };
        } else if (assignment.startDateTime > Date.now()) {
            return { assignment, isEndAssignment: false, isActiveAssignment: false };
        } else {
            return { assignment, isEndAssignment: false, isActiveAssignment: true };
        }
    }, []);
    const sortedAssignments: INormalizeAssignments[] = _.orderBy(
        refactoredAssignments,
        ['isEndAssignment', 'assignment.startDateTime'],
        ['asc', 'desc'],
    );
    return { assignments: sortedAssignments };
};

const getAssignmentsByCourseIdAndUserId = (courseId: string, studentId: string) => {
    return AssignmentModel.find({ courseId, studentId })
        .lean()
        .exec();
};

const getTasksByTaskId = (arrayOfTasksId: string[]) => {
    return TaskModel.find({ _id: arrayOfTasksId })
        .lean()
        .exec();
};
