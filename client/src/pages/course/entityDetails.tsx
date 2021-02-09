import React, { useMemo, useState } from 'react';
import { Header } from 'components';
import { useRouter } from 'next/router';
import { useAsync } from 'react-use';
import withCourseData from 'components/withCourseData';
import { withSession } from 'components';
import { useLoading } from 'components/useLoading';
import { CourseService, CourseTaskDetails, CourseEvent } from '../../services/course';
import { CoursePageProps } from 'services/models';
import TaskDetails from 'components/Schedule/taskDetails';
import EventDetails from 'components/Schedule/eventDetails';

export function EntityDetailsPage(props: CoursePageProps) {
  const router = useRouter();
  const { entityType, entityId, course } = router.query;

  const [entityData, setEntityData] = useState<CourseTaskDetails | CourseEvent>();
  const [, withLoading] = useLoading(false);

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

  useAsync(
    withLoading(async () => {
      if (entityType === 'task') {
        const entity = await courseService.getCourseTask(entityId as string);
        setEntityData(entity as CourseTaskDetails);
      }
      if (entityType === 'event') {
        const entity = await courseService.getEventById(entityId as string);
        setEntityData(entity as CourseEvent);
      }
    }),
    [courseService],
  );

  if (!entityData) return <></>;

  const eventHeaderTitle = `Event details (course: ${course})`;
  const taskHeaderTitle = `Task details (course: ${course})`;
  return (
    <>
      <Header title={entityType === 'event' ? eventHeaderTitle : taskHeaderTitle} username={props.session.githubId} />
      {entityType === 'task' && <TaskDetails taskData={entityData as CourseTaskDetails} />}
      {entityType === 'event' && <EventDetails eventData={entityData as CourseEvent} />}
    </>
  );
}

export default withCourseData(withSession(EntityDetailsPage));
