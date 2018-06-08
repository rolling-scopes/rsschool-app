import { CourseMentorDocument, CourseStudentDocument, ICourseMentorModel } from '../../models';
import { ILogger } from '../../logger';

export async function assignMentorsByPreference(courseId: string, logger: ILogger) {
    logger.info('Assigning mentors by preference', { courseId });
    const mentorsWithPreferedStudents = await selectMentorsWithPreferences(courseId);
    logger.info(`${courseId}: Mentors with prefered students: [${mentorsWithPreferedStudents.length}]`);
    await doAssigning(mentorsWithPreferedStudents, courseId);
}

const selectMentorsWithPreferences = async (courseId: string) => {
    return CourseMentorDocument.find({
        courseId,
        preferedMentees: { $exists: true, $ne: [] },
    }).exec();
};

const doAssigning = async (mentors: ICourseMentorModel[], courseId: string) => {
    await mentors.reduce((chain, mentor) => chain.then(() => assignMentor(mentor, courseId)), Promise.resolve());
};

const assignMentor = async (courseMentor: ICourseMentorModel, courseId: string) => {
    courseMentor.mentees = courseMentor.preferedMentees.map(({ _id }: { _id: string }) => ({
        _id,
    }));
    courseMentor.menteeCapacity = Math.max(courseMentor.menteeCapacity - courseMentor.mentees.length, 0);
    await CourseStudentDocument.updateMany(
        {
            courseId,
            userId: { $in: courseMentor.preferedMentees.map(({ _id }) => _id) },
        },
        {
            $set: {
                mentors: [{ _id: courseMentor.userId }],
            },
        },
    );
    await courseMentor.save();
};
