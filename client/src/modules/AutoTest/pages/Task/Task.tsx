import React, { useContext, useMemo, useState } from 'react';
import { CoursePageProps } from 'services/models';
import { CourseTaskDetailedDto } from 'api';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { Exercise, TaskDescription, VerificationInformation } from 'modules/AutoTest/components';
import { useCourseTaskVerifications } from '../../hooks/useCourseTaskVerifications';

export interface AutoTestTaskProps extends CoursePageProps {
  task: CourseTaskDetailedDto;
}

function Task({ course, task }: AutoTestTaskProps) {
  // TODO: recheck githubId and use from context instead
  const { githubId } = useContext(SessionContext);
  const [isExerciseVisible, setIsExerciseVisible] = useState(false);
  const { loading, verifications } = useCourseTaskVerifications(course.id, task.id);
  const score = useMemo(() => verifications?.[0]?.score ?? null, [verifications]);

  const startTask = () => setIsExerciseVisible(true);

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <TaskDescription courseAlias={course.alias} courseTask={task} score={score} />
      <VerificationInformation
        courseTask={task}
        loading={loading}
        startTask={startTask}
        verifications={verifications}
      />
      {isExerciseVisible && (
        <Exercise courseId={course.id} courseTask={task} githubId={githubId} verifications={verifications} />
      )}
    </PageLayout>
  );
}

export default Task;
