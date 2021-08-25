import { PageLayoutSimple } from '../components';
import withSession, { Session } from 'components/withSession';
import React, { useEffect, useMemo, useState } from 'react';
import { AddBestWork } from '../components/BestWorks/AddBestWork';
import withCourseData from '../components/withCourseData';
import { CoursePageProps } from '../services/models';
import { CourseService, CourseTask } from '../services/course';
import { SelectBestWork } from '../components/BestWorks/SelectBestWork';

type Props = CoursePageProps;

const rolesForSpecialBadges = ['coursemanager', 'manager', 'supervisor'];

const getIsAvailableButton = ({ coursesRoles }: Session, id: number): boolean => {
  const userCourseRoles = coursesRoles ? coursesRoles[id] : [];
  const isAvailableAddButton = [...(userCourseRoles ?? [])].some(role => rolesForSpecialBadges.includes(role));
  return isAvailableAddButton;
};

function Page(props: Props) {
  const [tasks, setTasks] = useState<CourseTask[]>([]);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

  const isAvailableAddButton = getIsAvailableButton(props.session, Number(localStorage.getItem('activeCourseId')));

  async function getTasks() {
    const courseTasks = await courseService.getCourseTasks('finished');
    setTasks(courseTasks);
  }

  useEffect(() => {
    getTasks();
  }, [props.course.id]);

  return (
    <PageLayoutSimple loading={false} githubId={props.session.githubId} title="Best works">
      {isAvailableAddButton && <AddBestWork course={props.course.id} tasks={tasks} />}
      <SelectBestWork />
    </PageLayoutSimple>
  );
}

export default withCourseData(withSession(Page));
