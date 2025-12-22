import { CoursesInterviewsApi } from '@client/api';
import { templates } from 'data/interviews';
import { ParsedUrlQuery } from 'querystring';
import type { CourseOnlyPageProps } from 'services/models';

export type FeedbackProps = CourseOnlyPageProps & {
  interviewTaskId: number;
  type: keyof typeof templates;
  githubId: string;
};

const coursesInterviewsApi = new CoursesInterviewsApi();

/**
 * Gets regular interview data
 */
export async function getInterviewData({
  query,
  courseId,
}: {
  query: ParsedUrlQuery;
  courseId: number;
}): Promise<Omit<FeedbackProps, keyof CourseOnlyPageProps>> {
  const githubId = query.githubId as string;
  const type = query.type as FeedbackProps['type'];

  const response = await coursesInterviewsApi.getInterviews(courseId, false);
  const interview =
    response.data.find(interview => (interview.attributes as { template?: string })?.template === type) ?? null;

  if (interview == null) {
    throw new Error('Interview not found');
  }

  return {
    interviewTaskId: interview.id,
    type,
    githubId,
  };
}
