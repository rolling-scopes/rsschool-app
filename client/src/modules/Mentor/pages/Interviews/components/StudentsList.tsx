import { Alert, Spin } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { useState } from 'react';
import { MentorInterview } from 'services/course';
import { StudentInterview } from './StudentInterview';
import { InterviewsSummary } from './InterviewsSummary';
import { InterviewDto } from 'api';
import { Course } from 'services/models';
import { useLoading } from 'components/useLoading';
import { useAsyncFn } from 'react-use';

type StudentsListProps = {
  interviews: MentorInterview[] | undefined;
  course: Course;
  interview: InterviewDto;
  fetchStudentInterviews: () => Promise<void>;
};

export function StudentsList(props: StudentsListProps) {
  const { interviews = [], course, interview, fetchStudentInterviews } = props;
  const template = interview.attributes?.template;
  const [isExpanded, setIsExpanded] = useState(false);

  const [loading, withLoading] = useLoading();
  const [, reloadList] = useAsyncFn(withLoading(fetchStudentInterviews));

  if (!interviews.length) {
    return (
      <Alert
        icon={<InfoCircleTwoTone />}
        showIcon
        description="You don't have any assigned interviews yet."
        type="info"
      />
    );
  }

  return (
    <Spin spinning={loading}>
      <div className="container">
        <InterviewsSummary
          interview={interview}
          interviews={interviews}
          courseId={course.id}
          toggleDetails={() => setIsExpanded(!isExpanded)}
          reloadList={reloadList}
          courseAlias={course.alias}
        />
        {isExpanded && (
          <div>
            {interviews.map(interview => (
              <StudentInterview
                key={interview.student.githubId}
                interview={interview}
                courseAlias={course.alias}
                template={template}
              />
            ))}
          </div>
        )}
        <style jsx>{`
          .container {
            margin: 15px 0;
          }
        `}</style>
      </div>
    </Spin>
  );
}
