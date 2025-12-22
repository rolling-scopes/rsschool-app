import { Button, Card } from 'antd';
import { InterviewPeriod } from 'domain/interview';
import styles from './InterviewCard.module.css';
import { InterviewDetails } from './InterviewDetails';
import { InterviewDto } from '@client/api';
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
      className={styles.container}
      title={name}
      extra={<InterviewPeriod startDate={startDate} endDate={endDate} />}
      key={id}
    >
      {description && <p>{description}</p>}
      <Button type="link" href={descriptionUrl} target="_blank" className={styles.link}>
        Read more
      </Button>
      <InterviewDetails
        interviewTask={interviewTask}
        course={course}
        interviews={interviews}
        fetchStudentInterviews={fetchStudentInterviews}
      />
    </Card>
  );
}
