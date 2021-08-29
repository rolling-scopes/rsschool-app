import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Row } from 'antd';
import { flattenDeep } from 'lodash';
import { Session } from 'components/withSession';
import { BestWorkService, IPostBestWork } from '../../../services/bestWork';
import { PageLayout } from '../../../components';
import { BestWorkModal } from '../components/BestWorkModal';
import { BestWorkCard } from '../components/BestWorkCard/BestWorkCard';
import { IUser } from '../components/BestWorkCard/BestWorkCardDescription';
import { CoursesService } from '../../../services/courses';
import { BestWorkMenu } from '../components/BestWorkMenu';
import { BestWorkAdd } from '../components/BestWorkAdd';
import { Course } from '../../../services/models';

export type Props = {
  session: Session;
  courses: Course[];
};

type UpdateBestWorkType = Omit<IPostBestWork, 'githubId'> & { users: IUser[] | number[] };

export interface IBestWork {
  id: number;
  users: IUser[];
  projectUrl: string;
  imageUrl: string;
  tags: string[];
  task: number;
  course: number;
}

const rolesForBestWork = ['coursemanager', 'manager', 'supervisor'];

const getIsAvailableButton = ({ coursesRoles }: Session): boolean => {
  const userCourseRoles = coursesRoles ? (flattenDeep(Object.values(coursesRoles)) as string[]) : [];
  const isAvailableAddButton = [...(userCourseRoles ?? [])].some(role => rolesForBestWork.includes(role));
  return isAvailableAddButton;
};

export function BestWork(props: Props) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [works, setWorks] = useState<IBestWork[]>([]);
  const [work, setWork] = useState<IBestWork | undefined>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [taskId, setTaskId] = useState<number>();
  const bestWorkService = useMemo(() => new BestWorkService(), []);
  const coursesService = useMemo(() => new CoursesService(), []);

  useEffect(() => {
    loadCourses();
  }, []);

  const isAvailableAddButton = getIsAvailableButton(props.session);

  async function loadCourses() {
    const courses = await coursesService.getCourses();
    setCourses(courses);
  }

  async function selectTaskHandler(id: number) {
    const res = await bestWorkService.getWorkListByTask(id);
    setTaskId(id);
    setWorks(res.sort((r1, r2) => r1.id - r2.id));
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
      //don't change position of updated work
      setWorks([...works.filter(w => w.id !== result[0].id), ...result].sort((r1, r2) => r1.id - r2.id));
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
      {isAvailableAddButton && <BestWorkAdd courses={courses} finishHandler={finishHandler} />}
      <BestWorkMenu taskSelectOnChange={selectTaskHandler} />
      <Row style={{ marginTop: '30px' }} gutter={24}>
        <BestWorkCard
          works={works}
          isManageAccess={isAvailableAddButton}
          deleteCardHandler={deleteCardHandler}
          editHandler={editHandler}
        />
      </Row>
      <BestWorkModal
        courses={courses}
        isModalVisible={isModalVisible}
        finishHandler={updateHandler}
        setIsModalVisible={setIsModalVisible}
        work={work}
      />
    </PageLayout>
  );
}
