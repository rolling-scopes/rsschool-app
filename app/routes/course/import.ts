import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import * as csvParse from 'csv-parse';
import { UserModel, CourseStudentModel, IUser, ICourseStudent, ICourseMentor, CourseMentorModel } from '../../models';

interface InputMentor {
    FirstName: string;
    LastName: string;
    City: string;
    Capacity: string;
    CoMentor: string;
    GitHub: string;
    Contacts: string;
    PreferedStudents: string;
}

interface InputStudent {
    FullName: string;
    Github: string;
    Email: string;
    Phone: string;
    University: string;
    City: string;
    English: string;
}

async function csvToJson<T>(csvString: string) {
    return new Promise<T[]>((resolve, reject) => {
        csvParse(
            csvString,
            {
                columns: true,
                relax_column_count: true,
            },
            (err: Error, output: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(output);
            },
        );
    });
}

function getGithubId(githubLikeString: string) {
    return githubLikeString
        .trim()
        .toLowerCase()
        .replace('https://github.com/', '')
        .replace('http://github.com/', '')
        .split('/')[0]
        .split('(')[0];
}

export const courseImportMentorsRoute = async (ctx: Router.RouterContext) => {
    try {
        const courseId = ctx.params.id;
        const mentors: InputMentor[] = await csvToJson<InputMentor>(ctx.request.rawBody);
        await Promise.all([
            mentors.map(mentor => {
                const id = getGithubId(mentor.GitHub);
                return Promise.all([
                    UserModel.update(
                        { _id: id },
                        {
                            _id: id,
                            isAdmin: false,
                            profile: {
                                city: mentor.City,
                                firstName: mentor.FirstName,
                                githubId: id,
                                lastName: mentor.LastName,
                            },
                            role: 'mentor',
                        } as IUser,
                        { upsert: true },
                    ),
                    CourseMentorModel.create({
                        city: mentor.City,
                        courseId,
                        excludeReason: undefined,
                        isActive: true,
                        menteeCapacity: parseInt(mentor.Capacity, 10) || 0,
                        mentees: [],
                        preferedMentees: mentor.PreferedStudents.split(',')
                            .filter(i => i.trim())
                            .map(studentId => ({
                                _id: getGithubId(studentId),
                            })),

                        userId: id,
                    } as ICourseMentor),
                ]);
            }),
        ]);
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};

export const courseImportStudentsRoute = async (ctx: Router.RouterContext) => {
    try {
        const courseId = ctx.params.id;
        const students: InputStudent[] = await csvToJson<InputStudent>(ctx.request.rawBody);
        await Promise.all([
            students.map(student => {
                const id = getGithubId(student.Github);
                const [firstName, lastName] = student.FullName.split(' ');
                return Promise.all([
                    UserModel.update(
                        { _id: id },
                        {
                            _id: id,
                            isAdmin: false,
                            profile: {
                                city: student.City,
                                firstName,
                                githubId: id,
                                lastName,
                            },
                            role: 'student',
                        } as IUser,
                        { upsert: true },
                    ),
                    CourseStudentModel.create({
                        city: student.City,
                        courseId,
                        englishLevel: student.English,
                        excludeReason: undefined,
                        isActive: true,
                        mentors: [],
                        userId: id,
                    } as ICourseStudent),
                ]);
            }),
        ]);
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
