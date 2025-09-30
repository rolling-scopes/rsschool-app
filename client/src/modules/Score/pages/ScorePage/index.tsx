import { CourseNoAccess } from 'modules/Course/components/CourseNoAccess';
import { CoursePageLayout } from 'components/CoursePageLayout';
import { useContext, useState } from 'react';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { ScoreTableTabs } from '@client/modules/Score/components/ScoreTable/ScoreTableTabs';

export function ScorePage() {
  const { course } = useActiveCourseContext();
  const session = useContext(SessionContext);

  const [loading, setLoading] = useState(false);

  return !course ? (
    <CourseNoAccess />
  ) : (
    <CoursePageLayout showCourseName course={course} title="Score" githubId={session.githubId} loading={loading}>
      <ScoreTableTabs
        tabProps={{
          course,
          session,
          onLoading: setLoading,
        }}
      />
    </CoursePageLayout>
  );
}
