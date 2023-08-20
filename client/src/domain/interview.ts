import { StageInterviewFeedbackVerdict, InterviewDetails as CommonInterviewDetails } from 'common/models';
import dayjs from 'dayjs';
import between from 'dayjs/plugin/isBetween';
import { featureToggles } from 'services/features';
dayjs.extend(between);

export function friendlyStageInterviewVerdict(value: StageInterviewFeedbackVerdict) {
  switch (value) {
    case 'didNotDecideYet':
      return 'No decision yet';
    case 'no':
      return 'No';
    case 'yes':
      return 'Yes';
    case 'noButGoodCandidate':
      return 'No, but good student';
    default:
      return value;
  }
}

export type InterviewDetails = CommonInterviewDetails;

export enum InterviewStatus {
  NotCompleted,
  Completed,
  Canceled,
}

export const stageInterviewType = 'stage-interview';

export function isInterviewRegistrationInProgress(interviewStartDate: string) {
  const startDate = dayjs(interviewStartDate).subtract(2, 'weeks');

  return dayjs().isBetween(startDate, interviewStartDate);
}

export function isInterviewStarted(interviewStartDate: string) {
  return dayjs().isAfter(dayjs(interviewStartDate));
}

export function getInterviewFeedbackUrl({
  courseAlias,
  interviewName,
  interviewId,
  studentGithubId,
  template,
  studentId,
}: {
  courseAlias: string;
  studentGithubId: string;
  studentId: number;
  template?: string | null;
  interviewName: string;
  interviewId: number;
}) {
  const isScreening = isTechnicalScreening(interviewName);
  if (!featureToggles.feedback && isScreening) {
    return `/course/mentor/interview-technical-screening?course=${courseAlias}&githubId=${studentGithubId}`;
  }
  const type = isScreening ? stageInterviewType : template;
  return `/course/interview/${type}/feedback?course=${courseAlias}&githubId=${studentGithubId}&studentId=${studentId}&interviewId=${interviewId}`;
}

export function isTechnicalScreening(name: string) {
  return name.includes('Technical Screening');
}

export const getInterviewWaitList = (courseAlias: string, interviewId: number) =>
  `/course/mentor/interview-wait-list?course=${courseAlias}&interviewId=${interviewId}`;

/** calculates the rating based on the interview score. rating scales from [0,5] */
export function getRating(score: number, maxScore: number, feedbackVersion: number) {
  if (!feedbackVersion) {
    // In the legacy feedback, the score is a number with limit 50
    const maxScore = 50;
    return (score > maxScore ? maxScore : score) / 10;
  }
  // calculate rating on the scale from 0 to 5
  const rating = (score / maxScore) * 5;
  return rating;
}
