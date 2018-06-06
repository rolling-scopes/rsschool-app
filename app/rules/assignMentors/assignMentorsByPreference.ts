import { CourseMentorDocument, CourseStudentDocument, ICourseMentorModel } from '../../models';
import { ILogger } from '../../logger';

export async function assignMentorsByPreference(courseId: string, logger: ILogger) {
    logger.info('Assigning mentors by preference', { courseId });
    const mentorsWithPreferedStudents = await selectMentorsWithPrefered(courseId);
    logger.info(`${courseId}: Mentors with prefered students: [${mentorsWithPreferedStudents.length}]`);
    await assignPreferedStudents(mentorsWithPreferedStudents, courseId);
}

const selectMentorsWithPrefered = async (courseId: string) => {
    return CourseMentorDocument.find({
        courseId,
        preferedMentees: { $exists: true, $ne: [] },
    }).exec();
};

const assignPreferedStudents = async (mentors: ICourseMentorModel[], courseId: string) => {
    await mentors.reduce(
        (chain, mentor) => chain.then(() => assignPreferedStudent(mentor, courseId)),
        Promise.resolve(),
    );
};

const assignPreferedStudent = async (courseMentor: ICourseMentorModel, courseId: string) => {
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
