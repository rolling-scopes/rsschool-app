import React, { useMemo, useState } from 'react';
import { Header } from 'components';
import { useRouter } from 'next/router';
import { useAsync } from 'react-use';
import withCourseData from 'components/withCourseData';
import { withSession } from 'components';
import { useLoading } from 'components/useLoading';
import { CourseService, CourseTaskDetails, CourseEvent } from '../../services/course';
import { CoursePageProps } from 'services/models';
import TaskDetails from 'components/Schedule/TaskDetails';
import EventDetails from 'components/Schedule/EventDetails';
import ModalFormEntity from 'components/Schedule/ModalFormEntity';

export function EntityDetailsPage(props: CoursePageProps) {
  const router = useRouter();
  const { entityType, entityId, course } = router.query;
  const alias = Array.isArray(course) ? course[0] : course;
  const [entityData, setEntityData] = useState<CourseTaskDetails | CourseEvent>();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editableRecord, setEditableRecord] = useState<CourseTaskDetails | CourseEvent | null>(null);
  const [, withLoading] = useLoading(false);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

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
          isAdmin={props.session.isAdmin}
        />
      )}
      {entityType === 'event' && (
        <EventDetails eventData={entityData as CourseEvent} alias={alias} onEdit={handleFullEdit} />
      )}
      {isModalOpen && (
        <ModalFormEntity
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
