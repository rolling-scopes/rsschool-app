import React, { useContext, useMemo, useState } from 'react';
import { CoursePageProps } from 'services/models';
import { CourseTaskDetailedDto } from 'api';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { Exercise, TaskDescription, VerificationInformation } from 'modules/AutoTest/components';
import { useCourseTaskVerifications } from 'modules/AutoTest/hooks';

export interface AutoTestTaskProps extends CoursePageProps {
  task: CourseTaskDetailedDto;
}

function Task({ course, task }: AutoTestTaskProps) {
  // TODO: recheck githubId and use from context instead
  const { githubId } = useContext(SessionContext);
  const [isExerciseVisible, setIsExerciseVisible] = useState(false);
  const { loading, reloadVerifications, task: courseTask } = useCourseTaskVerifications(course.id, task);
  const score = useMemo(() => courseTask?.verifications?.[0]?.score ?? null, [courseTask?.verifications]);

  const startTask = () => setIsExerciseVisible(true);

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <TaskDescription courseAlias={course.alias} courseTask={courseTask} score={score} />
      <VerificationInformation
        courseTask={courseTask}
        loading={loading}
        startTask={startTask}
      />
      {isExerciseVisible && (
        <Exercise
          courseId={course.id}
          courseTask={courseTask}
          githubId={githubId}
          reloadVerifications={reloadVerifications}
        />
      )}
    </PageLayout>
  );
}

export default Task;
