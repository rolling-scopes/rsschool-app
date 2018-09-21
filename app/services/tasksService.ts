import { TaskModel } from '../models';

export async function getCourseRelated() {
    const tasks = await TaskModel.aggregate([
        { $match: { courseId: /.*/i } },
        { $group: { _id: '$courseId', doc: { $push: '$$ROOT' } } },
    ]).exec();

    const courseRelatedTasks = tasks.reduce(
        (coursesTasks: any, courseTasks: any) => ({ ...coursesTasks, [courseTasks._id]: courseTasks.doc }),
        {},
    );

    return courseRelatedTasks;
}
