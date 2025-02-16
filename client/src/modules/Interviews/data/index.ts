import { FeedbackProps } from './getInterviewData';
import { StageFeedbackProps } from './getStageInterviewData';

export { getInterviewData, type FeedbackProps } from './getInterviewData';
export { getStageInterviewData, type StageFeedbackProps } from './getStageInterviewData';

export type PageProps = FeedbackProps | StageFeedbackProps;
