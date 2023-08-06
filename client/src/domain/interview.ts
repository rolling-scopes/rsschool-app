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
  interviewTaskId,
}: {
  courseAlias: string;
  studentGithubId: string;
  studentId: number;
  template?: string | null;
  interviewName: string;
  interviewId: number;
  interviewTaskId: number;
}) {
  const isScreening = isTechnicalScreening(interviewName);
  if (!featureToggles.feedback && isScreening) {
    return `/course/mentor/interview-technical-screening?course=${courseAlias}&githubId=${studentGithubId}`;
  }

  const type = isScreening ? stageInterviewType : template;
  return `/course/interview/${type}/feedback?course=${courseAlias}&githubId=${studentGithubId}&studentId=${studentId}&interviewId=${interviewId}&interviewTaskId=${interviewTaskId}`;
}

export function isTechnicalScreening(name: string) {
  return name.includes('Technical Screening');
}

export const getInterviewWaitList = (courseAlias: string, interviewId: number) =>
  `/course/mentor/interview-wait-list?course=${courseAlias}&interviewId=${interviewId}`;
