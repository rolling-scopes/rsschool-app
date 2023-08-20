import { Alert, Spin } from 'antd';
import InfoCircleTwoTone from '@ant-design/icons/InfoCircleTwoTone';
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
  interviewTask: InterviewDto;
  fetchStudentInterviews: () => Promise<void>;
};

export function InterviewsList(props: StudentsListProps) {
  const { interviews = [], course, interviewTask, fetchStudentInterviews } = props;
  const template = interviewTask.attributes?.template;
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
          interviewTask={interviewTask}
          interviews={interviews}
          courseId={course.id}
          toggleDetails={() => setIsExpanded(!isExpanded)}
          reloadList={reloadList}
          courseAlias={course.alias}
        />
        {isExpanded && (
          <div>
            {interviews.map(studentInterview => (
              <StudentInterview
                key={studentInterview.student.githubId}
                interview={studentInterview}
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
