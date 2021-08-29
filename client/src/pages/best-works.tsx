import { PageLayout } from '../components';
import withSession, { Session } from 'components/withSession';
import React, { useMemo, useState } from 'react';
import { AddBestWork } from '../components/BestWorks/AddBestWork';
import withCourseData from '../components/withCourseData';
import { CoursePageProps } from '../services/models';
import { SelectBestWork } from '../components/BestWorks/SelectBestWork';
import { BestWorkCard } from '../components/BestWorks/BestWorkCard/BestWorkCard';
import { Modal, Row } from 'antd';
import { BestWorkService, IPostBestWork } from '../services/bestWork';
import { ModalBestWork } from '../components/BestWorks/ModalBestWork';
import { IUser } from '../components/BestWorks/BestWorkCard/BestWorkCardDescription';

export type Props = CoursePageProps;

type UpdateBestWorkType = Omit<IPostBestWork, 'githubId'> & { users: IUser[] | number[] };

export interface IBestWork {
  id: number;
  users: IUser[];
  projectUrl: string;
  imageUrl: string;
  tags: string[];
  task: number;
}

const rolesForSpecialBadges = ['coursemanager', 'manager', 'supervisor'];

const getIsAvailableButton = ({ coursesRoles }: Session, id: number): boolean => {
  const userCourseRoles = coursesRoles ? coursesRoles[id] : [];
  const isAvailableAddButton = [...(userCourseRoles ?? [])].some(role => rolesForSpecialBadges.includes(role));
  return isAvailableAddButton;
};

function Page(props: Props) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [works, setWorks] = useState<IBestWork[]>([]);
  const [work, setWork] = useState<IBestWork | undefined>();
  const [taskId, setTaskId] = useState<number>();
  const bestWorkService = useMemo(() => new BestWorkService(), []);
  const isAvailableAddButton = getIsAvailableButton(props.session, Number(localStorage.getItem('activeCourseId')));

  async function selectTaskHandler(id: number) {
    const res = await bestWorkService.getWorkListByTask(id);
    setTaskId(id);
    setWorks(res);
  }

  function deleteCardHandler(id: number) {
    Modal.confirm({ content: 'Are you really want to delete this work?', onOk: () => deleteWork(id) });
  }

  async function finishHandler(bestWork: IPostBestWork, updateWork = false) {
    let result: IBestWork[] = [];
    if (!updateWork) result = await bestWorkService.postBestWork(bestWork);
    else if (bestWork.id) {
      result = await bestWorkService.putBestWork(bestWork.id, bestWork);
      setWorks(works.filter(w => w.id !== bestWork.id));
    }
    if (taskId === bestWork.task) {
      console.log(result);
      setWorks([...works.filter(w => w.id !== result[0].id), ...result]);
    } else {
      //TODO: add to cash
    }
  }

  async function updateHandler(bestWork: UpdateBestWorkType) {
    const dataForSave = {
      id: work?.id,
      ...bestWork,
    };
    const isUpdate = true;
    await finishHandler(dataForSave, isUpdate);
  }

  async function editHandler(work: IBestWork) {
    await setWork(work);
    setIsModalVisible(true);
  }

  async function deleteWork(id: number) {
    await bestWorkService.deleteBestWork(id);
    setWorks(works.filter(w => w.id !== id));
  }

  return (
    <PageLayout loading={false} githubId={props.session.githubId} title="Best works">
      {isAvailableAddButton && <AddBestWork course={props.course.id} finishHandler={finishHandler} />}
      <SelectBestWork taskSelectOnChange={selectTaskHandler} />
      <Row style={{ marginTop: '30px' }} gutter={24}>
        <BestWorkCard
          works={works}
          isManageAccess={isAvailableAddButton}
          deleteCardHandler={deleteCardHandler}
          editHandler={editHandler}
        />
      </Row>
      <ModalBestWork
        course={props.course.id}
        isModalVisible={isModalVisible}
        finishHandler={updateHandler}
        setIsModalVisible={setIsModalVisible}
        work={work}
      />
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));
