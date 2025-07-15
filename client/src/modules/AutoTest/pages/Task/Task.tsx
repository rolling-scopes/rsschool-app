import { useContext } from 'react';
import { CoursePageProps } from 'services/models';
import { CourseTaskDetailedDto } from 'api';
import { PageLayout } from 'components/PageLayout';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { AttemptsAnswers, Exercise, TaskDescription, VerificationInformation } from 'modules/AutoTest/components';
import { useCourseTaskVerifications, useVerificationsAnswers } from 'modules/AutoTest/hooks';
import { useRouter } from 'next/router';
import { theme } from 'antd';

export interface AutoTestTaskProps extends CoursePageProps {
  task: CourseTaskDetailedDto;
}

function Task() {
  const { course } = useActiveCourseContext();
  const { githubId } = useContext(SessionContext);
  const { query } = useRouter();

  const courseTaskId = Number(query.courseTaskId);

  const { loading, tasks, isExerciseVisible, startTask, finishTask, reload } = useCourseTaskVerifications(course.id);
  const { answers, showAnswers, hideAnswers } = useVerificationsAnswers(course.id, courseTaskId);
  const courseTask = tasks?.find(t => t.id === courseTaskId);

  const { token } = theme.useToken();

  if (!courseTask) {
    return null;
  }

  return (
    <PageLayout loading={false} title="Auto-tests" withMargin={false} showCourseName background={token.colorBgLayout}>
      <TaskDescription courseAlias={course.alias} courseTask={courseTask} />
      <div style={{ margin: 16 }}>
        {!answers ? (
          <VerificationInformation
            courseTask={courseTask}
            loading={loading}
            isTableVisible={!isExerciseVisible}
            startTask={startTask}
            reload={reload}
            showAnswers={showAnswers}
          />
        ) : (
          <AttemptsAnswers attempts={answers} hideAnswers={hideAnswers} />
        )}
        {isExerciseVisible && (
          <Exercise courseId={course.id} courseTask={courseTask} githubId={githubId} finishTask={finishTask} />
        )}
      </div>
    </PageLayout>
  );
}

export default Task;
