import { getRepository } from 'typeorm';
import { StageInterviewDetailedFeedback } from '../../../../common/models/profile';
import { getFullName } from '../../rules';
import { User, Mentor, Student, Course, StageInterview, StageInterviewFeedback, CourseTask } from '../../models';
import { stageInterviewService } from '../../services';
import { StageInterviewFeedbackJson } from '../../../../common/models';

type FeedbackData = {
  decision: string;
  isGoodCandidate: boolean;
  courseName: string;
  courseFullName: string;
  interviewResultJson: any;
  interviewFeedbackDate: string;
  interviewerFirstName: string;
  interviewerLastName: string;
  interviewerGithubId: string;
  feedbackVersion: null | number;
  interviewScore: null | number;
  maxScore: number;
};

export const getStageInterviewFeedback = async (githubId: string): Promise<StageInterviewDetailedFeedback[]> =>
  (
    await getRepository(StageInterview)
      .createQueryBuilder('stageInterview')
      .select('"stageInterview"."decision" AS "decision"')
      .addSelect('"stageInterview"."isGoodCandidate" AS "isGoodCandidate"')
      .addSelect('"stageInterview"."score" AS "interviewScore"')
      .addSelect('"course"."name" AS "courseName"')
      .addSelect('"course"."fullName" AS "courseFullName"')
      .addSelect('"stageInterviewFeedback"."json" AS "interviewResultJson"')
      .addSelect('"stageInterviewFeedback"."updatedDate" AS "interviewFeedbackDate"')
      .addSelect('"stageInterviewFeedback"."version" AS "feedbackVersion"')
      .addSelect('"userMentor"."firstName" AS "interviewerFirstName"')
      .addSelect('"userMentor"."lastName" AS "interviewerLastName"')
      .addSelect('"userMentor"."githubId" AS "interviewerGithubId"')
      .addSelect('"courseTask"."maxScore" AS "maxScore"')
      .leftJoin(Student, 'student', '"student"."id" = "stageInterview"."studentId"')
      .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
      .leftJoin(Course, 'course', '"course"."id" = "stageInterview"."courseId"')
      .leftJoin(
        StageInterviewFeedback,
        'stageInterviewFeedback',
        '"stageInterview"."id" = "stageInterviewFeedback"."stageInterviewId"',
      )
      .leftJoin(CourseTask, 'courseTask', '"courseTask"."id" = "stageInterview"."courseTaskId"')
      .leftJoin(Mentor, 'mentor', '"mentor"."id" = "stageInterview"."mentorId"')
      .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .andWhere('"stageInterview"."isCompleted" = true')
      .orderBy('"course"."updatedDate"', 'ASC')
      .getRawMany()
  )
    .map((data: FeedbackData) => {
      const {
        feedbackVersion,
        decision,
        interviewFeedbackDate,
        interviewerFirstName,
        courseFullName,
        courseName,
        interviewerLastName,
        interviewerGithubId,
        isGoodCandidate,
        interviewScore,
        interviewResultJson,
        maxScore,
      } = data;
      const feedbackTemplate = JSON.parse(interviewResultJson);
      const { score, feedback } = !feedbackVersion
        ? parseLegacyFeedback(feedbackTemplate)
        : {
            feedback: feedbackTemplate,
            score: interviewScore ?? 0,
          };

      return {
        version: feedbackVersion ?? 0,
        date: interviewFeedbackDate,
        decision,
        isGoodCandidate,
        courseName,
        courseFullName,
        feedback,
        score,
        interviewer: {
          name: getFullName(interviewerFirstName, interviewerLastName, interviewerGithubId),
          githubId: interviewerGithubId,
        },
        maxScore,
      };
    })
    .filter(Boolean);

// this is legacy form
function parseLegacyFeedback(interviewResult: StageInterviewFeedbackJson) {
  const { english, programmingTask, resume } = interviewResult;
  const { rating, htmlCss, common, dataStructures } = stageInterviewService.getInterviewRatings(interviewResult);

  return {
    score: rating,
    feedback: {
      english: english.levelMentorOpinion ? english.levelMentorOpinion : english.levelStudentOpinion,
      programmingTask,
      comment: resume.comment,
      skills: {
        htmlCss,
        common,
        dataStructures,
      },
    },
  };
}
