import { CoursesInterviewsApi, InterviewDto } from 'api';
import { PageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, MentorInterview } from 'services/course';
import { CoursePageProps } from 'services/models';
import { InteviewCard } from './components/InterviewCard';
import { MentorOptionsProvider } from './components/MentorPreferencesModal';
import groupBy from 'lodash/groupBy';
import type { Dictionary } from 'lodash';

export function Interviews(props: CoursePageProps) {
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [studentsByInterview, setStudentsByInterview] = useState<Dictionary<MentorInterview[]>>({});
  const [loading, withLoading] = useLoading();
  const { course } = props;

  const fetchStudentInterviews = useCallback(async () => {
    const interviews = await new CourseService(course.id).getMentorInterviews(props.session.githubId);
    setStudentsByInterview(groupBy(interviews, 'name'));
  }, [course.id, props.session.githubId]);

  const loadData = async () => {
    const [{ data }] = await Promise.all([
      new CoursesInterviewsApi().getInterviews(course.id, false, ['interview', 'stage-interview']),
      fetchStudentInterviews(),
    ]);

    setInterviews(data);
  };

  useAsync(withLoading(loadData), []);

  return (
    <PageLayout loading={loading} title="Interviews" githubId={props.session.githubId} courseName={course.name}>
      <MentorOptionsProvider course={course} session={props.session}>
        <div className="container">
          {interviews.map(interview => (
            <InteviewCard
              interview={interview}
              key={interview.id}
              course={course}
              students={studentsByInterview[interview.name]}
              fetchStudentInterviews={fetchStudentInterviews}
            />
          ))}
        </div>
      </MentorOptionsProvider>
      <style jsx>{`
        .container {
          display: flex;
          margin: 0 auto;
          width: 100%;
          max-width: 1200px;
          flex-direction: column;
        }
      `}</style>
    </PageLayout>
  );
}
