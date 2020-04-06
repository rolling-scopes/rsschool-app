import { getRepository } from 'typeorm';
import { StageInterviewDetailedFeedback } from '../../../../common/models/profile';
import { getFullName } from '../../rules';
import { User, Mentor, Student, Course, StageInterview, StageInterviewFeedback } from '../../models';
import { stageInterviewService } from '../../services';

export const getStageInterviewFeedback = async (githubId: string): Promise<StageInterviewDetailedFeedback[]> =>
  (
    await getRepository(StageInterview)
      .createQueryBuilder('stageInterview')
      .select('"stageInterview"."decision" AS "decision"')
      .addSelect('"stageInterview"."isGoodCandidate" AS "isGoodCandidate"')
      .addSelect('"course"."name" AS "courseName"')
      .addSelect('"course"."fullName" AS "courseFullName"')
      .addSelect('"stageInterviewFeedback"."json" AS "interviewResultJson"')
      .addSelect('"stageInterviewFeedback"."updatedDate" AS "interviewFeedbackDate"')
      .addSelect('"userMentor"."firstName" AS "interviewerFirstName"')
      .addSelect('"userMentor"."lastName" AS "interviewerLastName"')
      .addSelect('"userMentor"."githubId" AS "interviewerGithubId"')
      .leftJoin(Student, 'student', '"student"."id" = "stageInterview"."studentId"')
      .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
      .leftJoin(Course, 'course', '"course"."id" = "stageInterview"."courseId"')
      .leftJoin(
        StageInterviewFeedback,
        'stageInterviewFeedback',
        '"stageInterview"."id" = "stageInterviewFeedback"."stageInterviewId"',
      )
      .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
      .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .andWhere('"stageInterview"."isCompleted" = true')
      .orderBy('"course"."updatedDate"', 'ASC')
      .getRawMany()
  ).map(
    ({
      decision,
      isGoodCandidate,
      courseName,
      courseFullName,
      interviewResultJson,
      interviewFeedbackDate,
      interviewerFirstName,
      interviewerLastName,
      interviewerGithubId,
    }: any) => {
      const interviewResult = JSON.parse(interviewResultJson);
      const { english, programmingTask, resume } = interviewResult;
      const { rating, htmlCss, common, dataStructures } = stageInterviewService.getInterviewRatings(interviewResult);
      return {
        decision,
        isGoodCandidate,
        courseName,
        courseFullName,
        programmingTask,
        rating,
        comment: resume.comment,
        english: english.levelMentorOpinion ? english.levelMentorOpinion : english.levelStudentOpinion,
        date: interviewFeedbackDate,
        skills: {
          htmlCss,
          common,
          dataStructures,
        },
        interviewer: {
          name: getFullName(interviewerFirstName, interviewerLastName, interviewerGithubId),
          githubId: interviewerGithubId,
        },
      } as StageInterviewDetailedFeedback;
    },
  );
