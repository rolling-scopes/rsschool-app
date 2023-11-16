import { Button, Layout, message } from 'antd';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { CreateTaskDto, CriteriaDto, DisciplineDto, DisciplinesApi, TaskDto, TasksApi, TasksCriteriaApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { useModalForm } from 'hooks';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { TaskType } from 'modules/CrossCheck/components/CrossCheckCriteriaForm';
import { TasksTable, TaskModal } from 'modules/Tasks/components';
import { FormValues } from 'modules/Tasks/types';

const { Content } = Layout;

const tasksApi = new TasksApi();
const criteriaApi = new TasksCriteriaApi();
const disciplinesApi = new DisciplinesApi();

export function TasksPage() {
  const { courses } = useActiveCourseContext();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [dataCriteria, setDataCriteria] = useState<CriteriaDto[]>([]);
  const { open, mode, formData, toggle: toggleModal } = useModalForm<FormValues>();

  const { loading } = useAsync(async () => {
    if (formData) return;

    const [{ data: tasksData }, { data: disciplines }] = await Promise.all([
      tasksApi.getTasks(),
      disciplinesApi.getDisciplines(),
    ]);
    setTasks(tasksData);
    setDisciplines(disciplines);
  }, [open, formData]);

  const handleAddItem = () => {
    setDataCriteria([]);
    toggleModal();
  };

  const handleEditItem = async (record: TaskDto) => {
    const { data } = await criteriaApi.getTaskCriteria(record.id);
    setDataCriteria(data.criteria ?? []);
    toggleModal(prepareValues(record));
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

        if (mode === 'edit') {
          if (!formData?.id) {
            return;
          }

          await tasksApi.updateTask(formData.id, record);
          const { data } = await criteriaApi.getTaskCriteria(formData.id);

          if (data.criteria) {
            await criteriaApi.updateTaskCriteria(formData.id, { criteria: dataCriteria });
          } else {
            await criteriaApi.createTaskCriteria(formData.id, { criteria: dataCriteria });
          }
        } else {
          const { data: task } = await tasksApi.createTask(record);
          await criteriaApi.createTaskCriteria(task.id, { criteria: dataCriteria });
        }

        toggleModal();
      } catch (e) {
        message.error('An error occurred. Please try again later.');
      } finally {
        setModalLoading(false);
      }
    },
    [formData, modalLoading, dataCriteria, mode],
  );

  return (
    <AdminPageLayout title="Manage Tasks" loading={loading} courses={courses}>
      <Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleAddItem}>
          Add Task
        </Button>
        <TasksTable data={tasks} handleEditItem={handleEditItem} />
      </Content>
      {open && (
        <TaskModal
          tasks={tasks}
          disciplines={disciplines}
          dataCriteria={dataCriteria}
          modalLoading={modalLoading}
          mode={mode}
          formData={formData}
          setDataCriteria={setDataCriteria}
          toggleModal={toggleModal}
          handleModalSubmit={handleModalSubmit}
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

function prepareValues(task: TaskDto) {
  return {
    ...task,
    attributes: JSON.stringify(task.attributes, null, 2),
    discipline: task.discipline?.id,
  };
}
