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
        city: { $ne: null },
        courseId,
        menteeCapacity: { $gt: 0 },
    }).exec();

    const mentorsMap = mentorsWithCities.reduce(
        (acc: { [key: string]: ICourseMentorModel[] }, prev: ICourseMentorModel) => {
            if (!acc[prev.city]) {
                acc[prev.city] = [];
            }
            acc[prev.city].push(prev);
            return acc;
        },
        {} as { [key: string]: ICourseMentorModel[] },
    );

    return Object.keys(mentorsMap).map(key => ({ mentors: mentorsMap[key], city: key }));
};

const doAssigning = async (courseId: string, mentors: ICourseMentorModel[], city: string) => {
    const studentsCount = await CourseStudentModel.count({
        city,
        mentors: [],
    }).exec();
    const averageStudentsPerMentor = Math.round(studentsCount / mentors.length);
    return mentors.reduce(
        (chain, mentor) =>
            chain.then(() =>
                assignMentor(mentor, courseId, city, Math.min(mentor.menteeCapacity, averageStudentsPerMentor)),
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
    courseMentor.mentees = courseStudents.map(({ userId }) => ({ _id: userId }));
    courseMentor.menteeCapacity = Math.max(courseMentor.menteeCapacity - courseStudents.length, 0);

    await Promise.all([
        courseMentor.save(),
        await CourseStudentModel.updateMany(
            {
                city,
                courseId,
                mentors: [],
                userId: { $in: courseMentor.preferedMentees.map(({ _id }) => _id) },
            },
            {
                $set: {
                    mentors: [{ _id: courseMentor.userId }] as IUserBase[],
                },
            },
        ),
    ]);
};
