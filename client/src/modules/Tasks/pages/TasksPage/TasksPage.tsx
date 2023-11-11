import { Button, Layout, message } from 'antd';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { AdminPageLayout } from 'components/PageLayout';
import { CreateTaskDto, CriteriaDto, DisciplineDto, DisciplinesApi, TaskDto, TasksApi, TasksCriteriaApi } from 'api';
import { TaskType } from 'modules/CrossCheck/components/CrossCheckCriteriaForm';
import { TasksTable, TaskModal } from 'modules/Tasks/components';
import { FormValues, ModalAction, ModalData } from 'modules/Tasks/types';
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
  const [modalAction, setModalAction] = useState<ModalAction>(ModalAction.Update);
  const [dataCriteria, setDataCriteria] = useState<CriteriaDto[]>([]);

  const { loading } = useAsync(async () => {
    if (modalData) return;

    const [{ data: tasks }, { data: disciplines }] = await Promise.all([
      tasksApi.getTasks(),
      disciplinesApi.getDisciplines(),
    ]);
    setData(tasks);
    setDisciplines(disciplines);
  }, [modalData]);

  const handleAddItem = () => {
    setDataCriteria([]);
    setModalData({});
    setModalAction(ModalAction.Create);
  };

  const handleEditItem = async (record: TaskDto) => {
    const { data } = await criteriaApi.getTaskCriteria(record.id);
    setDataCriteria(data.criteria ?? []);
    setModalData(prepareValues(record));
    setModalAction(ModalAction.Update);
  };

  const handleModalSubmit = useCallback(
    async (values: FormValues) => {
      const checkCriteria = () => {
        return dataCriteria.every(item => {
          if (item.type !== TaskType.Title) {
            return item.max !== 0;
          }
          return true;
        });
      };

      const isVerified = checkCriteria();
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

        if (!record) {
          return;
        }

        if (modalAction === ModalAction.Update) {
          if (!modalData?.id) {
            return;
          }

          await tasksApi.updateTask(modalData.id, record);
          const { data } = await criteriaApi.getTaskCriteria(modalData.id);

          if (data.criteria) {
            await criteriaApi.updateTaskCriteria(modalData.id, { criteria: dataCriteria });
          } else {
            await criteriaApi.createTaskCriteria(modalData.id, { criteria: dataCriteria });
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
          modalAction={modalAction}
          modalLoading={modalLoading}
          setDataCriteria={setDataCriteria}
          setModalData={setModalData}
        />
      )}
    </AdminPageLayout>
  );
}

function createRecord({
  type,
  name,
  descriptionUrl,
  discipline,
  githubPrRequired,
  githubRepoName,
  sourceGithubRepoUrl,
  description,
  tags,
  skills,
  attributes,
}: FormValues) {
  if (!type || !name || !descriptionUrl || !discipline) {
    return null;
  }

  const data: CreateTaskDto = {
    // required form fields
    type,
    name,
    disciplineId: discipline,
    descriptionUrl,

    // not required form fields
    githubPrRequired: !!githubPrRequired,
    githubRepoName: githubRepoName ?? '',
    sourceGithubRepoUrl: sourceGithubRepoUrl ?? '',
    description: description ?? '',
    tags: tags ?? [],
    skills: skills?.map((skill: string) => skill.toLowerCase()) ?? [],
    attributes: JSON.parse(attributes ?? '{}') as Record<string, unknown>,
  };

  return data;
}

function prepareValues(modalData: TaskDto) {
  return {
    ...modalData,
    attributes: JSON.stringify(modalData.attributes, null, 2),
  };
}
