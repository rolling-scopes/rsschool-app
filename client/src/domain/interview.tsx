import { Tag, Typography } from 'antd';
import { TaskDtoTypeEnum } from 'api';
import { StageInterviewFeedbackVerdict, InterviewDetails as CommonInterviewDetails } from 'common/models';
import { Decision } from 'data/interviews/technical-screening';
import dayjs from 'dayjs';
import between from 'dayjs/plugin/isBetween';
import { featureToggles } from 'services/features';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import { formatDate, formatShortDate } from 'services/formatter';

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

export function getInterviewResult(decision: Decision) {
  switch (decision) {
    case Decision.Yes:
      return 'Mentor accepted';
    case Decision.No:
      return 'Mentor declined';
    case Decision.Draft:
      return 'No decision yet';
    case Decision.SeparateStudy:
      return 'Separate study';
    case Decision.MissedIgnoresMentor:
      return 'Ignored mentor';
    case Decision.MissedWithReason:
      return 'Missed with a reason';
    default:
      return friendlyStageInterviewVerdict(decision as StageInterviewFeedbackVerdict);
  }
}

export type InterviewDetails = CommonInterviewDetails;

export enum InterviewStatus {
  NotCompleted,
  Completed,
  Canceled,
}

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
  const type = isScreening ? TaskDtoTypeEnum.StageInterview : template;
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

export function DecisionTag({ decision, status }: { decision?: Decision; status?: InterviewStatus }) {
  if (!decision) {
    return (
      <Tag color={status === InterviewStatus.Completed ? 'green' : undefined}>
        {status === InterviewStatus.Completed ? 'Completed' : 'Uncompleted'}
      </Tag>
    );
  }

  switch (decision) {
    case Decision.Yes:
    case Decision.No:
      return <Tag color="green">Completed</Tag>;
    case Decision.Draft:
      return <Tag color="orange">Unfilled form</Tag>;
    case Decision.SeparateStudy:
      return <Tag color="blue">Separate study</Tag>;
    case Decision.MissedIgnoresMentor:
      return <Tag color="red">Ignored mentor</Tag>;
    case Decision.MissedWithReason:
      return <Tag color="cyan">Missed with a reason</Tag>;
    default: {
      // fallback to the old feedback values
      if (decision === 'noButGoodCandidate') {
        return <Tag color="green">Completed</Tag>;
      }
      if (decision === 'didNotDecideYet') {
        return <Tag color="orange">Unfilled form</Tag>;
      }
      return <Tag>Uncompleted</Tag>;
    }
  }
}

export function InterviewPeriod({
  startDate,
  endDate,
  shortDate,
}: {
  startDate: string;
  endDate: string;
  shortDate?: boolean;
}) {
  const format = shortDate ? formatShortDate : formatDate;
  return (
    <div className="interview-period">
      <Typography.Text type="secondary">
        <CalendarOutlined style={{ marginRight: 8 }} />
        {`${format(startDate)} - ${format(endDate)}`}
      </Typography.Text>
    </div>
  );
}

export const isRegistrationNotStarted = (studentRegistrationStartDate: string): boolean => {
  return !!studentRegistrationStartDate && new Date() < new Date(studentRegistrationStartDate);
};
