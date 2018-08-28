import { ILogger } from '../../logger';
import { CourseMentorModel, CourseStudentModel, ICourseMentorModel, IUserBase } from '../../models';

export async function assignMentorsByCity(courseId: string, logger: ILogger) {
    logger.info('Assign mentors by city', { courseId });
    const courseMentorsByCity = await groupCourseMentorsByCity(courseId);
    return Promise.all(courseMentorsByCity.map(({ city, mentors }) => doAssigning(courseId, mentors, city)));
}

const groupCourseMentorsByCity = async (
    courseId: string,
): Promise<{ city: string; mentors: ICourseMentorModel[] }[]> => {
    const mentorsWithCities: ICourseMentorModel[] = await CourseMentorModel.find({
        $expr: { $gt: ['$menteeCapacity', { $size: '$mentees' }] },
        city: { $ne: null },
        courseId,
    }).exec();

    const mentorMap = mentorsWithCities.reduce(
        (acc: { [key: string]: ICourseMentorModel[] }, prev: ICourseMentorModel) => {
            if (!acc[prev.city]) {
                acc[prev.city] = [];
            }
            acc[prev.city].push(prev);
            return acc;
        },
        {} as { [key: string]: ICourseMentorModel[] },
    );

    return Object.keys(mentorMap).map(key => ({ city: key, mentors: mentorMap[key] }));
};

const doAssigning = async (courseId: string, mentors: ICourseMentorModel[], city: string) => {
    const studentsCount = await CourseStudentModel.count({
        city,
        mentors: [],
    }).exec();
    const averageStudentsPerMentors = Math.round(studentsCount / mentors.length);
    return mentors.reduce(
        (chain, mentor) =>
            chain.then(() =>
                assignMentor(
                    mentor,
                    courseId,
                    city,
                    Math.min(mentor.menteeCapacity - mentor.mentees.length, averageStudentsPerMentors),
                ),
            ),
        Promise.resolve(),
    );
};

const assignMentor = async (courseMentor: ICourseMentorModel, courseId: string, city: string, num: number) => {
    const courseStudents = await CourseStudentModel.find({
        city,
        courseId,
        mentors: [],
    })
        .limit(num)
        .exec();
    const studentsByCity = courseStudents.map(({ userId }: { userId: string }) => ({ _id: userId }));
    await courseMentor.update({
        $addToSet: {
            mentees: { $each: studentsByCity },
        },
    });
    const studentsIds = courseStudents.map(({ userId }) => userId);
    await Promise.all([
        courseMentor.save(),
        await CourseStudentModel.updateMany(
            {
                city,
                courseId,
                userId: { $in: studentsIds },
            },
            {
                $addToSet: {
                    mentors: { $each: [{ _id: courseMentor.userId }] as IUserBase[] },
                },
            },
        ).exec(),
    ]);
};
