import { Button, Checkbox, Form, Row, Col, Input, Collapse, Layout, message, Select, Table, Divider } from 'antd';
import withSession, { Session } from 'components/withSession';
import { boolIconRenderer, stringSorter, tagsRenderer, getColumnSearchProps } from 'components/Table';
import { union } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { githubRepoUrl, urlPattern } from 'services/validators';
import { ModalForm } from 'components/Forms';
import { SKILLS } from 'data/skills';
import { TASK_TYPES } from 'data/taskTypes';
import { AdminPageLayout } from 'components/PageLayout';
import { Course, CourseRole } from 'services/models';
import { CreateTaskDto, CriteriaDto, DisciplineDto, DisciplinesApi, TaskDto, TasksApi, TasksCriteriaApi } from 'api';
import {
  UploadCriteriaJSON,
  AddCriteriaForCrossCheck,
  ExportJSONButton,
  addKeyAndIndex,
  EditableTable,
} from 'modules/CrossCheck';
import { TaskType } from 'modules/CrossCheck/components/CrossCheckCriteriaForm';

const { Content } = Layout;
type Props = { session: Session; courses: Course[] };
type ModalData = (Partial<Omit<TaskDto, 'attributes'>> & { attributes?: string }) | null;

const tasksApi = new TasksApi();
const criteriaApi = new TasksCriteriaApi();
const disciplinesApi = new DisciplinesApi();

function Page(props: Props) {
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
    <AdminPageLayout title="Manage Tasks" session={props.session} loading={loading} courses={props.courses}>
      <Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleAddItem}>
          Add Task
        </Button>
        <Table
          size="small"
          style={{ marginTop: 8 }}
          dataSource={data}
          pagination={{ pageSize: 100 }}
          rowKey="id"
          columns={getColumns(handleEditItem)}
        />
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
    attributes: JSON.parse(values.attributes ?? '{}'),
  };
  return data;
}

function prepareValues(modalData: TaskDto) {
  if (!modalData) {
    return modalData;
  }
  return {
    ...modalData,
    attributes: JSON.stringify(modalData.attributes, null, 2),
  };
}

function getColumns(handleEditItem: any) {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter<TaskDto>('name'),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Discipline',
      dataIndex: ['discipline', 'name'],
      sorter: stringSorter<TaskDto>('discipline'),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: tagsRenderer,
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      render: tagsRenderer,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sorter: stringSorter<TaskDto>('type'),
    },
    {
      title: 'Description URL',
      dataIndex: 'descriptionUrl',
      render: (value: string) =>
        value ? (
          <a title={value} href={value}>
            Link
          </a>
        ) : null,
      width: 80,
    },
    {
      title: 'PR Required',
      dataIndex: 'githubPrRequired',
      render: boolIconRenderer,
      width: 80,
    },
    {
      title: 'Repo Name',
      dataIndex: 'githubRepoName',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: TaskDto) => <a onClick={() => handleEditItem(record)}>Edit</a>,
    },
  ];
}

type ModalProps = {
  tasks: TaskDto[];
  modalData: ModalData;
  dataCriteria: CriteriaDto[];
  modalLoading: boolean;
  disciplines: DisciplineDto[];
  setDataCriteria: (c: CriteriaDto[]) => void;
  handleModalSubmit: (values: any) => Promise<void>;
  setModalData: (d: ModalData) => void;
  setModalValues: (v: any) => void;
};

function TaskModal({
  tasks,
  dataCriteria,
  modalData,
  modalLoading,
  disciplines,
  setDataCriteria,
  handleModalSubmit,
  setModalData,
  setModalValues,
}: ModalProps) {
  const addCriteria = (criteria: CriteriaDto) => {
    const newDataCriteria = [...dataCriteria, criteria];
    setDataCriteria(addKeyAndIndex(newDataCriteria));
  };

  const addJSONtoCriteria = (criteria: CriteriaDto[]) => {
    const oldCriteria = dataCriteria;
    const newCriteria = [...oldCriteria, ...criteria];
    setDataCriteria(addKeyAndIndex(newCriteria));
  };

  const allTags = useMemo(() => union(...tasks.map(task => task.tags || [])), [tasks]);
  const allSkills = useMemo(
    () =>
      union(
        tasks
          .map(task => task.skills || [])
          .concat(SKILLS)
          .flat()
          .sort(),
      ),
    [tasks],
  );

  return (
    <ModalForm
      data={modalData}
      title="Task"
      submit={handleModalSubmit}
      cancel={() => {
        setModalData(null);
        setDataCriteria([]);
      }}
      onChange={setModalValues}
      getInitialValues={getInitialValues}
      loading={modalLoading}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter task name' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="type" label="Task Type" rules={[{ required: true, message: 'Please select a type' }]}>
            <Select>
              {TASK_TYPES.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="discipline"
            label="Discipline"
            rules={[{ required: true, message: 'Please select a discipline' }]}
          >
            <Select>
              {disciplines.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags">
              {allTags.map(tag => (
                <Select.Option key={tag} value={tag}>
                  {tag}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="descriptionUrl"
        label="Description URL"
        rules={[
          {
            required: true,
            message: 'Please enter description URL',
          },
          {
            message: 'Please enter valid URL',
            pattern: urlPattern,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Summary">
        <Input />
      </Form.Item>

      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="skills" label="Skills">
            <Select mode="tags">
              {allSkills.map(skill => (
                <Select.Option key={skill} value={skill}>
                  {skill}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Collapse>
        <Collapse.Panel header="Criteria For Cross-Check Task" key="1" forceRender>
          <Form.Item label="Criteria For Cross-Check">
            <UploadCriteriaJSON onLoad={addJSONtoCriteria} />
          </Form.Item>
          <AddCriteriaForCrossCheck onCreate={addCriteria} />
          {dataCriteria.length !== 0 ? (
            <>
              <Divider />
              <EditableTable dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} />
              <ExportJSONButton dataCriteria={dataCriteria} />
            </>
          ) : null}
        </Collapse.Panel>
        <Collapse.Panel header="Github" key="2" forceRender>
          <Form.Item name="githubPrRequired" label="" valuePropName="checked">
            <Checkbox>Pull Request required</Checkbox>
          </Form.Item>
          <Form.Item name="sourceGithubRepoUrl" label="Source Repo Url" rules={[{ pattern: githubRepoUrl }]}>
            <Input placeholder="https://github.com/rolling-scopes-school/task1" />
          </Form.Item>
          <Form.Item name="githubRepoName" label="Expected Repo Name">
            <Input placeholder="task1" />
          </Form.Item>
        </Collapse.Panel>
        <Collapse.Panel header="JSON Attributes" key="3" forceRender>
          <Form.Item
            name="attributes"
            rules={[
              {
                validator: async (_, value: string) => (value ? JSON.parse(value) : Promise.resolve()),
                message: 'Invalid json',
              },
            ]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>
    </ModalForm>
  );
}

function getInitialValues(modalData: Partial<TaskDto>) {
  return { ...modalData, discipline: modalData.discipline?.id };
}

export { getServerSideProps };

export default withSession(Page, { requiredAnyCourseRole: CourseRole.Manager });
