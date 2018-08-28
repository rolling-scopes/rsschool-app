import { ILogger } from '../../logger';
import { CourseMentorModel, CourseStudentModel, ICourseMentorModel } from '../../models';

export async function assignMentorsByPreference(courseId: string, logger: ILogger) {
    logger.info('Assigning mentors by preference', { courseId });
    const mentorsWithPreferedStudents = await selectMentorsWithPreferences(courseId);
    logger.info(`${courseId}: Mentors with prefered students: [${mentorsWithPreferedStudents.length}]`);
    await doAssigning(mentorsWithPreferedStudents, courseId);
}

const selectMentorsWithPreferences = async (courseId: string) => {
    return CourseMentorModel.find({
        $expr: { $gte: ['$menteeCapacity', { $size: '$preferedMentees' }] },
        courseId,
        preferedMentees: { $exists: true, $ne: [] },
    }).exec();
};

const doAssigning = async (mentors: ICourseMentorModel[], courseId: string) => {
    await mentors.reduce((chain, mentor) => chain.then(() => assignMentor(mentor, courseId)), Promise.resolve());
};

const assignMentor = async (courseMentor: ICourseMentorModel, courseId: string) => {
    const preferedMentees = courseMentor.preferedMentees.map(({ _id }: { _id: string }) => ({ _id }));
    await courseMentor.update({
        $addToSet: {
            mentees: { $each: preferedMentees },
        },
    });
    await CourseStudentModel.updateMany(
        {
            courseId,
            userId: { $in: courseMentor.preferedMentees.map(({ _id }) => _id) },
        },
        {
            $addToSet: {
                mentors: { $each: [{ _id: courseMentor.userId }] },
            },
        },
    ).exec();
    await courseMentor.save();
};
