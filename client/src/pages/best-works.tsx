import { PageLayout } from '../components';
import withSession, { Session } from 'components/withSession';
import React, { useMemo, useState } from 'react';
import { AddBestWork } from '../components/BestWorks/AddBestWork';
import withCourseData from '../components/withCourseData';
import { CoursePageProps } from '../services/models';
import { SelectBestWork } from '../components/BestWorks/SelectBestWork';
import { BestWorkCard } from '../components/BestWorks/BestWorkCard/BestWorkCard';
import { Row } from 'antd';
import { BestWorkService } from '../services/bestWork';

type Props = CoursePageProps;

export interface IBestWorks {
  id: number;
  users: string[];
  projectUrl: string;
  imageUrl: string;
  tags: string[];
}

const rolesForSpecialBadges = ['coursemanager', 'manager', 'supervisor'];

const getIsAvailableButton = ({ coursesRoles }: Session, id: number): boolean => {
  const userCourseRoles = coursesRoles ? coursesRoles[id] : [];
  const isAvailableAddButton = [...(userCourseRoles ?? [])].some(role => rolesForSpecialBadges.includes(role));
  return isAvailableAddButton;
};

function Page(props: Props) {
  const [works, setWorks] = useState<IBestWorks[]>([]);
  const bestWorkService = useMemo(() => new BestWorkService(), []);
  const isAvailableAddButton = getIsAvailableButton(props.session, Number(localStorage.getItem('activeCourseId')));

  async function selectTaskHandler(id: number) {
    const res = await bestWorkService.getWorkListByTask(id);
    setWorks(res);
  }

  return (
    <PageLayout loading={false} githubId={props.session.githubId} title="Best works">
      {isAvailableAddButton && <AddBestWork course={props.course.id} />}
      <SelectBestWork taskSelectOnChange={selectTaskHandler} />
      <Row style={{ marginTop: '30px' }} gutter={24}>
        <BestWorkCard works={works} isManageAccess={isAvailableAddButton} />
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));
