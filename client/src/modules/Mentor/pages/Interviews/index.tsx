import { CoursesInterviewsApi, InterviewDto, TaskDtoTypeEnum } from '@client/api';
import { useRequest } from 'ahooks';
import { PageLayout } from '@client/shared/components/PageLayout';
import { useCallback, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CourseService, MentorInterview } from '@client/services/course';
import { InterviewCard } from './components/InterviewCard';
import { MentorOptionsProvider } from './components/MentorPreferencesModal';
import groupBy from 'lodash/groupBy';
import type { Dictionary } from 'lodash';
import { SessionContext, useActiveCourseContext } from '@client/modules/Course/contexts';
import styles from './index.module.css';

export function Interviews() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [interviewsByTask, setInterviewsByTask] = useState<Dictionary<MentorInterview[]>>({});

  const fetchStudentInterviews = useCallback(async () => {
    const interviews = await new CourseService(course.id).getMentorInterviews(session.githubId);
    setInterviewsByTask(groupBy(interviews, 'name'));
  }, [course.id, session.githubId]);

  const { loading, runAsync: loadData } = useRequest(
    async () => {
      const [{ data }] = await Promise.all([
        new CoursesInterviewsApi().getInterviews(course.id, false, [
          TaskDtoTypeEnum.Interview,
          TaskDtoTypeEnum.StageInterview,
        ]),
        fetchStudentInterviews(),
      ]);

      setInterviews(data);
    },
    { manual: true },
  );

  useAsync(async () => loadData(), []);

  return (
    <PageLayout loading={loading} title="Interviews" showCourseName>
      <MentorOptionsProvider course={course} session={session}>
        <div className={styles.container}>
          {interviews.map(interviewTask => (
            <InterviewCard
              interviewTask={interviewTask}
              key={interviewTask.id}
              course={course}
              interviews={interviewsByTask[interviewTask.name] ?? []}
              fetchStudentInterviews={fetchStudentInterviews}
            />
          ))}
        </div>
      </MentorOptionsProvider>
    </PageLayout>
  );
}
