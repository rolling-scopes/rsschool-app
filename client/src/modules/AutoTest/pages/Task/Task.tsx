import React, { useContext, useMemo, useState } from 'react';
import { CoursePageProps } from 'services/models';
import { CourseTaskDetailedDto } from 'api';
import { message } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { useAsync } from 'react-use';
import { CourseService, Verification } from 'services/course';
import { useLoading } from 'components/useLoading';
import { Exercise, TaskDescription } from 'modules/AutoTest/components';
import { VerificationInformation } from '../../components/VerificationInformation/VerificationInformation';
import { getVerificationsByTask } from '../../utils/getVerificationsByTask';

export interface AutoTestTaskProps extends CoursePageProps {
  task: CourseTaskDetailedDto;
}

function Task({ course, task }: AutoTestTaskProps) {
  // TODO: recheck githubId and use from context instead
  const { githubId } = useContext(SessionContext);
  const [loading, withLoading] = useLoading(false);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isExerciseVisible, setIsExerciseVisible] = useState(false);
  const courseService = useMemo(() => new CourseService(course.id), []);

  const score = useMemo(() => verifications?.[0]?.score ?? null, [verifications]);

  useAsync(
    withLoading(async () => {
      try {
        const verifications = await courseService.getTaskVerifications();
        const taskVerifications = getVerificationsByTask(verifications, task.id);
        setVerifications(taskVerifications);
      } catch (error) {
        message.error(error);
      }
    }),
    [],
  );

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
      {isExerciseVisible && <Exercise courseTask={task} githubId={githubId} verifications={verifications} />}
    </PageLayout>
  );
}

export default Task;
