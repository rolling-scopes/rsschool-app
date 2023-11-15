import { Button, Layout, message } from 'antd';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { AdminPageLayout } from 'components/PageLayout';
import { CreateTaskDto, CriteriaDto, DisciplineDto, DisciplinesApi, TaskDto, TasksApi, TasksCriteriaApi } from 'api';
import { TaskType } from 'modules/CrossCheck/components/CrossCheckCriteriaForm';
import { TasksTable, TaskModal } from 'modules/Tasks/components';
import { ModalData } from 'modules/Tasks/types';
import { useActiveCourseContext } from 'modules/Course/contexts';

const { Content } = Layout;

const tasksApi = new TasksApi();
const criteriaApi = new TasksCriteriaApi();
const disciplinesApi = new DisciplinesApi();

export function TasksPage() {
  const { courses } = useActiveCourseContext();
  const [data, setData] = useState<TaskDto[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState<ModalData>(null);
  const [modalAction, setModalAction] = useState('update');
  const [, setModalValues] = useState<any>({});
  const [dataCriteria, setDataCriteria] = useState<CriteriaDto[]>([]);

  const { loading } = useAsync(async () => {
    if (modalData) return;

    const [{ data: tasks }, { data: disciplines }] = await Promise.all([
      tasksApi.getTasks(),
      disciplinesApi.getDisciplines(),
    ]);
    setData(tasks);
    setDisciplines(disciplines || []);
  }, [modalData]);

  const handleAddItem = () => {
    setDataCriteria([]);
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = async (record: TaskDto) => {
    const { data } = await criteriaApi.getTaskCriteria(record.id);
    setDataCriteria(data.criteria ?? []);
    setModalData(prepareValues(record));
    setModalAction('update');
  };

  const handleModalSubmit = useCallback(
    async (values: any) => {
      const checkCriteria = () => {
        return dataCriteria.every(item => {
          if (item.type !== TaskType.Title) {
            return item.max !== 0;
          }
          return true;
        });
      };

      const isVerified = dataCriteria.length ? checkCriteria() : true;
      if (!isVerified) {
        message.error('Please, check criteria! It has subtask with no score.');
        return;
      }

      try {
        if (modalLoading) {
          return;
        }
        setModalLoading(true);
        const record = createRecord(values);
        if (modalAction === 'update') {
          await tasksApi.updateTask(modalData!.id!, record);
          const { data } = await criteriaApi.getTaskCriteria(modalData!.id!);
          if (data.criteria) {
            await criteriaApi.updateTaskCriteria(modalData!.id!, { criteria: dataCriteria });
          } else {
            await criteriaApi.createTaskCriteria(modalData!.id!, { criteria: dataCriteria });
          }
        } else {
          const { data: task } = await tasksApi.createTask(record);
          await criteriaApi.createTaskCriteria(task.id, { criteria: dataCriteria });
        }
        setModalData(null);
      } catch (e) {
        message.error('An error occurred. Please try again later.');
      } finally {
        setModalLoading(false);
      }
    },
    [modalData, modalAction, modalLoading, dataCriteria],
  );

  return (
    <AdminPageLayout title="Manage Tasks" loading={loading} courses={courses}>
      <Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleAddItem}>
          Add Task
        </Button>
        <TasksTable data={data} handleEditItem={handleEditItem} />
      </Content>
      {modalData && (
        <TaskModal
          tasks={data}
          dataCriteria={dataCriteria}
          disciplines={disciplines}
          handleModalSubmit={handleModalSubmit}
          modalData={modalData}
          modalLoading={modalLoading}
          setDataCriteria={setDataCriteria}
          setModalData={setModalData}
          setModalValues={setModalValues}
        />
      )}
    </AdminPageLayout>
  );
}

function createRecord(values: any) {
  const data: CreateTaskDto = {
    type: values.type,
    name: values.name,
    githubPrRequired: !!values.githubPrRequired,
    descriptionUrl: values.descriptionUrl,
    githubRepoName: values.githubRepoName,
    sourceGithubRepoUrl: values.sourceGithubRepoUrl,
    description: values.description,
    tags: values.tags,
    skills: values.skills?.map((skill: string) => skill.toLowerCase()),
    disciplineId: values.discipline,
    attributes: JSON.parse(values.attributes ?? '{}') as Record<string, unknown>,
  };
  return data;
}

function prepareValues(modalData: TaskDto) {
  return {
    ...modalData,
    attributes: JSON.stringify(modalData.attributes, null, 2),
  };
}
