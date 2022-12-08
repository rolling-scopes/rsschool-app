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
  const { name, descriptionUrl, id } = task;

  // TODO: recheck githubId and use from context instead
  const { githubId } = useContext(SessionContext);
  const [loading, withLoading] = useLoading(false);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const courseService = useMemo(() => new CourseService(course.id), []);

  useAsync(
    withLoading(async () => {
      try {
        const verifications = await courseService.getTaskVerifications();
        const taskVerifications = getVerificationsByTask(verifications, id);
        setVerifications(taskVerifications);
      } catch (error) {
        message.error(error);
      }
    }),
    [],
  );

  const startTask = () => setIsTableVisible(false);

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <TaskDescription courseAlias={course.alias} descriptionUrl={descriptionUrl} name={name} />
      {isTableVisible ? (
        <VerificationInformation
          courseTask={task}
          loading={loading}
          startTask={startTask}
          verifications={verifications}
        />
      ) : (
        <Exercise courseTask={task} githubId={githubId} verifications={verifications} />
      )}
    </PageLayout>
  );
}

export default Task;
