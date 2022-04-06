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
import { EventModalForm } from 'components/Schedule/EventModalForm';

export function EventPage(props: CoursePageProps) {
  const { session, course } = props;

  const router = useRouter();
  const { type, id } = router.query;
  const alias = Array.isArray(course) ? course[0].alias : course.alias;
  const [entityData, setEntityData] = useState<CourseTaskDetails | CourseEvent>();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editableRecord, setEditableRecord] = useState<CourseTaskDetails | CourseEvent | null>(null);
  const [, withLoading] = useLoading(false);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const isAdmin = useMemo(() => isCourseManager(session, course.id), [session, course]);

  const loadData = async () => {
    if (type === 'task') {
      const entity = await courseService.getCourseTask(id as string);
      setEntityData(entity as CourseTaskDetails);
    }
    if (type === 'event') {
      const entity = await courseService.getEventById(id as string);
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
      <Header title={type === 'event' ? 'Event' : 'Task'} username={props.session.githubId} />
      {type === 'task' && (
        <TaskDetails
          taskData={entityData as CourseTaskDetails}
          alias={alias}
          onEdit={handleFullEdit}
          isAdmin={isAdmin}
        />
      )}
      {type === 'event' && (
        <EventDetails eventData={entityData as CourseEvent} alias={alias} onEdit={handleFullEdit} isAdmin={isAdmin} />
      )}
      {isModalOpen && (
        <EventModalForm
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

export default withCourseData(withSession(EventPage));
