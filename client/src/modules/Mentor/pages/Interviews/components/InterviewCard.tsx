import { Button, Card } from 'antd';
import css from 'styled-jsx/css';
import { InterviewPeriod } from 'domain/interview';
import { InterviewDetails } from './InterviewDetails';
import { InterviewDto } from 'api';
import { Course } from 'services/models';
import { MentorInterview } from 'services/course';

export function InterviewCard(props: {
  interviewTask: InterviewDto;
  course: Course;
  interviews: MentorInterview[];
  fetchStudentInterviews: () => Promise<void>;
}) {
  const { interviewTask, course, interviews, fetchStudentInterviews } = props;
  const { name, startDate, endDate, id, description, descriptionUrl } = interviewTask;

  return (
    <Card
      hoverable
      className={containerCss.className}
      title={name}
      extra={<InterviewPeriod startDate={startDate} endDate={endDate} />}
      key={id}
    >
      {description && <p>{description}</p>}
      <Button type="link" href={descriptionUrl} target="_blank" className={linkCss.className}>
        Read more
      </Button>
      <InterviewDetails
        interviewTask={interviewTask}
        course={course}
        interviews={interviews}
        fetchStudentInterviews={fetchStudentInterviews}
      />
      {containerCss.styles}
      {linkCss.styles}
    </Card>
  );
}

const containerCss = css.resolve`
  div {
    margin-bottom: 16px;
    cursor: default;
  }

  div:last-child {
    margin-bottom: 0;
  }
`;

const linkCss = css.resolve`
  a {
    padding-left: 0;
  }
`;
