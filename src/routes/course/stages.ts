import * as Router from 'koa-router';
import { OK, NOT_FOUND } from 'http-status-codes';
import { Stage, Student, Mentor } from '../../models';
import { ILogger } from '../../logger';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

function shuffleArray(input: number[]): number[] {
    for (let i = input.length - 1; i >= 0; i--) {
        const randIndx = Math.floor(Math.random() * ( i + 1));
        const itemAtIndx = input[randIndx];
        input[randIndx] = input[i];
        input[i] = itemAtIndx;
    }
    return input;
}

function shuffleMentorIds(mentorIds: number[], studenIds: number[]): number[] {
    const res = [];

    for (let i = 0; i < mentorIds.length; i++) {
        for (let j = i; j < studenIds.length; j++) {
            const arr = shuffleArray(mentorIds);
            res[j] = arr[i];
        }
    }
    return res;
}

export const getCourseStages = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const stages = await getRepository(Stage)
    .createQueryBuilder('stage')
    .where('stage."courseId" = :courseId ', { courseId })
    .getMany();
  setResponse(ctx, OK, stages);
};

export const postCloseStage = (logger: ILogger) => async (ctx: Router.RouterContext) => {
    const stageId: number = ctx.params.stageId;
    const courseId: number = ctx.params.courseId;

    logger.info(`StageId ${stageId}`);
    logger.info(`CourseId ${courseId}`);

    const studentRepository = getRepository(Student);
    const mentorRepository = getRepository(Mentor);

    const mentors = await mentorRepository
        .createQueryBuilder('mentor')
        .innerJoinAndSelect('mentor.course', 'course')
        .where(
            'mentor.course.id = :courseId',
            {
                courseId,
            },
        )
        .getMany();

    if (mentors === undefined) {
        setResponse(ctx, NOT_FOUND);
        return;
    }

    const students = await studentRepository
        .createQueryBuilder('student')
        .innerJoinAndSelect('student.course', 'course')
        .where(
            'student."isExpelled" = :isExpelled and student.course.id = :courseId',
            {
                courseId,
                isExpelled: false,
            },
        )
        .getMany();

    if (students === undefined) {
        setResponse(ctx, NOT_FOUND);
        return;
    }

    const mentorIdsNext = shuffleMentorIds(mentors.map(m => m.id), students.map(s => s.id));

    const studentsWithNextMentor = students.map((st, i) => {
        const mentorId = mentorIdsNext[i];

        if (st.mentor) {
            if (st.mentor.id === mentorId) {
                const shuffledMentors = shuffleArray(mentorIdsNext);
                st.mentor.id = shuffledMentors[i];
            } else {
                st.mentor.id = mentorId;
            }
            return st;
        }

        const mentor: any = { id: mentorId };
        st = {...st, mentor };
        return st;
    });

    // logger.info(studentsWithNextMentor || '');

    await Promise.all(studentsWithNextMentor.map(student => studentRepository.save(student)));

    setResponse(ctx, OK, { mentorIdsNext });
};
