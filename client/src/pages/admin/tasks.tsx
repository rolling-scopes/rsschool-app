import { Button, Checkbox, Form, Row, Col, Input, Collapse, Layout, message, Select, Table, Divider } from 'antd';
import withSession, { Session } from 'components/withSession';
import { boolIconRenderer, stringSorter, tagsRenderer, getColumnSearchProps } from 'components/Table';
import { union } from 'lodash';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { Task, TaskService } from 'services/task';
import { githubRepoUrl, urlPattern } from 'services/validators';
import { ModalForm } from 'components/Forms';
import { SKILLS } from 'data/skills';
import { TASK_TYPES } from 'data/taskTypes';
import { AdminPageLayout } from 'components/PageLayout';
import { Course } from 'services/models';
import { DisciplineDto, DisciplinesApi } from 'api';
import { UploadCriteriaJSON } from 'modules/crossCheckCriteria/components/UploadCriteriaJSON';
import { AddCriteriaForCrossCheck } from 'modules/crossCheckCriteria/components/AddCriteriaForCrossCheck';
import { ExportJSONButton } from 'modules/crossCheckCriteria/components/ExportJSONButton';
import { CriteriaData } from 'services/course';
import { addKeyAndIndex } from 'modules/crossCheckCriteria/components/utils/addKeyAndIndex';
import { EditableTable } from 'modules/crossCheckCriteria/components/EditableTableForCrossCheck';

const { Content } = Layout;
type Props = { session: Session; courses: Course[] };
type ModalData = (Partial<Omit<Task, 'attributes'>> & { attributes?: string }) | null;
const service = new TaskService();
const disciplinesApi = new DisciplinesApi();

function Page(props: Props) {
  const [data, setData] = useState([] as Task[]);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState(null as ModalData);
  const [modalAction, setModalAction] = useState('update');
  const [modalValues, setModalValues] = useState<any>({});
  const [dataCriteria, setDataCriteria] = useState<CriteriaData[]>([]);

  const { loading } = useAsync(async () => {
    const [tasks, { data: disciplines }] = await Promise.all([service.getTasks(), disciplinesApi.getDisciplines()]);
    setData(tasks);
    setDisciplines(disciplines || []);
  }, [modalData]);

  const handleAddItem = () => {
    setDataCriteria([]);
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = async (record: Task) => {
    const criteria = await service.getCriteriaForCourseTask(record.id);
    criteria ? setDataCriteria(criteria) : setDataCriteria([]);
    setModalData(prepareValues(record));
    setModalAction('update');
  };

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        if (modalLoading) {
          return;
        }
        setModalLoading(true);
        const record = createRecord(values);
        if (modalAction === 'update') {
          await service.updateTask(modalData!.id!, record);
          if (await service.getCriteriaForCourseTask(modalData!.id!)) {
            await service.updateCriteriaForCourseTask(modalData!.id!, dataCriteria);
          } else {
            await service.createCriteriaForCourseTask(modalData!.id!, dataCriteria);
          }
        } else {
          const task = await service.createTask(record);
          const taskId = task.identifiers[0].id;
          await service.createCriteriaForCourseTask(taskId, dataCriteria);
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

  const renderModal = useCallback(() => {
    const addCriteria = (criteria: CriteriaData) => {
      const newDataCriteria = [...dataCriteria, criteria];
      setDataCriteria(addKeyAndIndex(newDataCriteria));
    };

    const addJSONtoCriteria = (criteria: string) => {
      const oldCriteria = dataCriteria;
      const addingCriteria = JSON.parse(criteria);
      const newCriteria = [...oldCriteria, ...addingCriteria];
      setDataCriteria(addKeyAndIndex(newCriteria));
    };

    const allTags = union(...data.map(d => d.tags || []));
    const allSkills = union(
      data
        .map(d => d.skills || [])
        .concat(SKILLS)
        .flat()
        .sort(),
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
            <Form.Item required name="disciplineId" label="Discipline">
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
  }, [modalData, modalValues, modalLoading, handleModalSubmit, dataCriteria]);

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
      {renderModal()}
    </AdminPageLayout>
  );
}

function createRecord(values: any) {
  const data: Partial<Task> = {
    type: values.type,
    name: values.name,
    githubPrRequired: !!values.githubPrRequired,
    descriptionUrl: values.descriptionUrl,
    githubRepoName: values.githubRepoName,
    sourceGithubRepoUrl: values.sourceGithubRepoUrl,
    tags: values.tags,
    skills: values.skills?.map((skill: string) => skill.toLowerCase()),
    disciplineId: values.disciplineId,
    attributes: JSON.parse(values.attributes ?? '{}'),
  };
  return data;
}

function prepareValues(modalData: Task) {
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
      sorter: stringSorter<Task>('name'),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Discipline',
      dataIndex: ['discipline', 'name'],
      sorter: stringSorter<Task>('discipline'),
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
      sorter: stringSorter<Task>('type'),
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
      render: (_: any, record: Task) => <a onClick={() => handleEditItem(record)}>Edit</a>,
    },
  ];
}

function getInitialValues(modalData: Partial<Task>) {
  return { ...modalData, discipline: modalData.discipline?.name };
}

export { getServerSideProps };

export default withSession(Page);
