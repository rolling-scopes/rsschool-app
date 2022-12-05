import { CoursesInterviewsApi, InterviewDto } from 'api';
import { PageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { CoursePageProps } from 'services/models';
import { InteviewCard } from './components/InterviewCard';

export function Interviews(props: CoursePageProps) {
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [loading, withLoading] = useLoading();

  const loadData = async () => {
    const { data } = await new CoursesInterviewsApi().getInterviews(props.course.id, false, [
      'interview',
      'stage-interview',
    ]);
    setInterviews(data);
  };

  useAsync(withLoading(loadData), []);

  return (
    <PageLayout loading={loading} title="Interviews" githubId={props.session.githubId} courseName={props.course.name}>
      <div className="container">
        {interviews.map(interview => (
          <InteviewCard interview={interview} key={interview.id} />
        ))}
      </div>
      <style jsx>{`
        .container {
          display: flex;
          margin: 0 auto;
          max-width: 90%;
          flex-direction: column;
        }
      `}</style>
    </PageLayout>
  );
}
