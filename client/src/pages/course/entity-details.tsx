import React, { useMemo, useState } from 'react';
import { Header } from 'components/Header';
import { useRouter } from 'next/router';
import { useAsync } from 'react-use';
import withCourseData from 'components/withCourseData';
import { withSession } from 'components/withSession';
import { useLoading } from 'components/useLoading';
import { CourseService, CourseTaskDetails, CourseEvent } from '../../services/course';
import { CoursePageProps } from 'services/models';
import { isCourseManager } from 'domain/user';
import { TaskDetails, EventDetails } from 'components/Schedule/EventDetails';
import { AddEventModal } from 'components/Schedule/AddEventModal';

export function EntityDetailsPage(props: CoursePageProps) {
  const { session, course } = props;

  const router = useRouter();
  const { entityType, entityId } = router.query;
  const alias = Array.isArray(course) ? course[0].alias : course.alias;
  const [entityData, setEntityData] = useState<CourseTaskDetails | CourseEvent>();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editableRecord, setEditableRecord] = useState<CourseTaskDetails | CourseEvent | null>(null);
  const [, withLoading] = useLoading(false);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const isAdmin = useMemo(() => isCourseManager(session, course.id), [session, course]);

  const loadData = async () => {
    if (entityType === 'task') {
      const entity = await courseService.getCourseTask(entityId as string);
      setEntityData(entity as CourseTaskDetails);
    }
    if (entityType === 'event') {
      const entity = await courseService.getEventById(entityId as string);
      setEntityData(entity as CourseEvent);
    }
  };

  useAsync(withLoading(loadData), [courseService]);

  if (!entityData) return <></>;

  const handleFullEdit = async (isTask?: boolean) => {
    if (isTask) {
      setEditableRecord({ ...entityData, isTask: true });
    } else {
      setEditableRecord(entityData);
    }

    setModalOpen(true);
  };

  const closeModal = async () => {
    setModalOpen(false);
  };

  return (
    <>
      <Header title={entityType === 'event' ? 'Event' : 'Task'} username={props.session.githubId} />
      {entityType === 'task' && (
        <TaskDetails
          taskData={entityData as CourseTaskDetails}
          alias={alias}
          onEdit={handleFullEdit}
          isAdmin={isAdmin}
        />
      )}
      {entityType === 'event' && (
        <EventDetails eventData={entityData as CourseEvent} alias={alias} onEdit={handleFullEdit} isAdmin={isAdmin} />
      )}
      {isModalOpen && (
        <AddEventModal
          visible={isModalOpen}
          editableRecord={editableRecord as CourseEvent}
          handleCancel={closeModal}
          courseId={props.course.id}
          refreshData={loadData}
        />
      )}
    </>
  );
}

export default withCourseData(withSession(EntityDetailsPage));
