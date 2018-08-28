import { ILogger } from '../../logger';
import { CourseMentorModel, CourseStudentModel, ICourseMentorModel, MentorSettings } from '../../models';

export async function assignMentorsByRandom(courseId: string, logger: ILogger) {
    logger.info('Assign mentors by random', { courseId });
    const courseMentorsWithSpareSlot = await groupCourseMentorsWithSpareSlot(courseId);
    logger.info(`${courseId}: Mentors with spare slot — [${courseMentorsWithSpareSlot.length}]`);
    await doAssigning(courseMentorsWithSpareSlot, courseId, logger);
}

const groupCourseMentorsWithSpareSlot = async (courseId: string) => {
    return CourseMentorModel.find({
        $expr: { $gte: ['$menteeCapacity', { $size: '$mentees' }] },
        courseId,
    }).exec();
};

const doAssigning = async (courseMentors: ICourseMentorModel[], courseId: string, logger: ILogger) => {
    const studentsCountWithoutMentor = await CourseStudentModel.count({
        courseId,
        mentors: [],
    });
    logger.info(`${courseId}: Students without mentor — [${studentsCountWithoutMentor}]`);
    let averageStudentsPerMentor = Math.ceil(studentsCountWithoutMentor / courseMentors.length);
    if (averageStudentsPerMentor === 0) {
        averageStudentsPerMentor = Math.ceil(studentsCountWithoutMentor % courseMentors.length);
    }
    await courseMentors.reduce(
        (chain, mentor) =>
            chain.then(() =>
                assignMentor(
                    mentor,
                    courseId,
                    Math.min(
                        mentor.menteeCapacity - mentor.mentees.length + MentorSettings.ExtraMentees,
                        averageStudentsPerMentor,
                    ),
                ),
            ),
        Promise.resolve(),
    );
};

const assignMentor = async (mentor: ICourseMentorModel, courseId: string, num: number) => {
    const studentsWithoutMentor = await CourseStudentModel.find({
        courseId,
        mentors: [],
    })
        .limit(num)
        .exec();
    const studentsIds = studentsWithoutMentor.map(({ userId }) => ({ _id: userId }));
    await mentor.update({
        $addToSet: {
            mentees: { $each: studentsIds },
        },
    });
    await Promise.all([
        await mentor.save(),
        await CourseStudentModel.updateMany(
            {
                courseId,
                userId: { $in: studentsWithoutMentor.map(({ userId }) => userId) },
            },
            {
                $addToSet: {
                    mentors: { $each: [{ _id: mentor.userId }] },
                },
            },
        ),
    ]);
};
