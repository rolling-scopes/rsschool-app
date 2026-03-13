import { useRequest } from 'ahooks';
import { TaskDtoTypeEnum } from '@client/api';
import { SessionProvider, useActiveCourseContext } from '@client/modules/Course/contexts';
import { getInterviewData, getStageInterviewData, PageProps } from '@client/modules/Interviews/data';
import { StageInterviewFeedback } from '@client/modules/Interviews/pages/StageInterviewFeedback';
import { InterviewFeedback } from '@client/modules/Interviews/pages/InterviewFeedback';
import { useRouter } from 'next/router';
import { CourseRole } from 'services/models';

export default function (props: PageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      <FeedbackWrapper />
    </SessionProvider>
  );
}

function FeedbackWrapper() {
  const { course } = useActiveCourseContext();
  const { query } = useRouter();

  const type = query.type as string;

  const { data } = useRequest(async () => {
    const data = await (type === TaskDtoTypeEnum.StageInterview
      ? getStageInterviewData({ courseId: course.id, query })
      : getInterviewData({ courseId: course.id, query }));
    return data;
  });

  if (!data) {
    return null;
  }

  const props: PageProps = {
    ...data,
    course,
  };

  return props.type === TaskDtoTypeEnum.StageInterview ? (
    <StageInterviewFeedback {...props} />
  ) : (
    <InterviewFeedback {...props} />
  );
}
