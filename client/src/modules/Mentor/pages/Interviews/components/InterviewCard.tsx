import { Button, Card } from 'antd';
import css from 'styled-jsx/css';
import { InterviewPeriod } from './InterviewPeriod';
import { useState } from 'react';
import { InterviewDetails } from './InterviewDetails';
import { InterviewDto } from 'api';
import { Course } from 'services/models';
import { MentorInterview } from 'services/course';

export function InteviewCard(props: {
  interview: InterviewDto;
  course: Course;
  students: MentorInterview[];
  fetchStudentInterviews: () => Promise<void>;
}) {
  const { interview, course, students, fetchStudentInterviews } = props;
  const { name, startDate, endDate, id, description } = interview;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      hoverable
      className={containerCss.className}
      title={name}
      extra={<InterviewPeriod startDate={startDate} endDate={endDate} />}
      key={id}
    >
      {description && <p>{description}</p>}
      <Button type="link" onClick={() => setIsExpanded(!isExpanded)}>
        Read more
      </Button>
      {isExpanded && (
        <InterviewDetails
          interview={interview}
          course={course}
          students={students}
          fetchStudentInterviews={fetchStudentInterviews}
        />
      )}
      {containerCss.styles}
    </Card>
  );
}

const containerCss = css.resolve`
  div {
    margin-bottom: 16px;
    pointer: default;
  }

  div:last-child {
    margin-bottom: 0;
  }
`;
