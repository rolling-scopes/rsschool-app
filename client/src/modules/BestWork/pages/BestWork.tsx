import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Modal } from 'antd';
import { flattenDeep } from 'lodash';
import { Session } from 'components/withSession';
import { BestWorkService } from '../../../services/bestWork/bestWork';
import { PageLayout } from '../../../components';
import { BestWorkModal } from '../components/BestWorkModal';
import { CoursesService } from '../../../services/courses';
import { BestWorkMenu } from '../components/BestWorkMenu';
import { BestWorkAdd } from '../components/BestWorkAdd';
import { Course } from '../../../services/models';
import { BestWorkTabs } from '../components/BestWorkTabs';
import { IBestWork, IPostBestWork, ITask, IUser } from '../interfaces';

const { Content } = Layout;

export type Props = {
  session: Session;
  courses: Course[];
};

type UpdateBestWorkType = Omit<IPostBestWork, 'githubId'> & { users: IUser[] | number[] };

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
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [taskId, setTaskId] = useState<number>();
  const bestWorkService = useMemo(() => new BestWorkService(), []);
  const coursesService = useMemo(() => new CoursesService(), []);

  useEffect(() => {
    loadCourses();
  }, []);

  const isAvailableAddButton = getIsAvailableButton(props.session);

  async function getCourseTaskList(id: number) {
    const taskList = await bestWorkService.getTaskList(id);
    setWorks([]);
    setTasks(taskList);
  }

  async function loadCourses() {
    const courses = await coursesService.getCourses();
    setCourses(courses);
  }

  async function selectTaskHandler(id: number) {
    const res = await bestWorkService.getWorkListByTask(id);
    setTaskId(id);
    setWorks(res.sort((r1, r2) => r1.id - r2.id));
  }

  function deleteCardHandler(w: IBestWork) {
    Modal.confirm({ content: 'Are you really want to delete this work?', onOk: () => deleteWork(w) });
  }

  async function finishHandler(bestWork: IPostBestWork, updateWork = false) {
    let result: IBestWork[] = [];
    if (!updateWork) result = await bestWorkService.postBestWork(bestWork);
    else if (bestWork.id) {
      result = await bestWorkService.putBestWork(bestWork.id, bestWork);
      setWorks(works.filter(w => w.id !== bestWork.id));
    }
    if (taskId === bestWork.task) {
      setWorks([...works.filter(w => w.id !== result[0].id), ...result].sort((r1, r2) => r1.id - r2.id));
    }
  }

  async function updateHandler(bestWork: UpdateBestWorkType) {
    const dataForSave = {
      id: work?.id,
      ...bestWork,
      task: bestWork.task ? bestWork.task : work!.task,
      course: bestWork.course ? bestWork.course : work!.course,
    };
    const isUpdate = true;
    await finishHandler(dataForSave, isUpdate);
  }

  async function editHandler(work: IBestWork) {
    await setWork(work);
    setIsModalVisible(true);
  }

  async function deleteWork(w: IBestWork) {
    await bestWorkService.deleteBestWork(w);
    setWorks(works.filter(work => work.id !== w.id));
  }

  return (
    <PageLayout loading={false} githubId={props.session.githubId} title="Best works">
      {isAvailableAddButton && <BestWorkAdd courses={courses} finishHandler={finishHandler} />}
      <Layout>
        <BestWorkMenu getCourseTaskList={getCourseTaskList} />
        <Content style={{ backgroundColor: 'white' }}>
          <BestWorkTabs
            tasks={tasks}
            selectTaskHandler={selectTaskHandler}
            works={works}
            isAvailableAddButton={isAvailableAddButton}
            deleteCardHandler={deleteCardHandler}
            editHandler={editHandler}
          />
        </Content>
      </Layout>
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
