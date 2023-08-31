import { Row, Col, Form, Input, Select, Card, Space, Tag, Collapse, Divider, Checkbox } from 'antd';
import { TaskDto, CriteriaDto, DisciplineDto } from 'api';
import { ModalForm } from 'components/Forms';
import { SKILLS } from 'data/skills';
import { TASK_TYPES } from 'data/taskTypes';
import { union } from 'lodash';
import {
  addKeyAndIndex,
  UploadCriteriaJSON,
  AddCriteriaForCrossCheck,
  EditableTable,
  ExportJSONButton,
} from 'modules/CrossCheck';
import { ModalData } from 'modules/Tasks/types';
import { useMemo } from 'react';
import { urlPattern, githubRepoUrl } from 'services/validators';

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

export function TaskModal({
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

      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="usedInCourses" label="Used in Courses">
            <Card>
              <Space size={[0, 8]} wrap>
                {modalData?.courses?.map(({ name, isActive }) => (
                  <Tag key={name} color={isActive ? 'blue' : ''}>
                    {name}
                  </Tag>
                ))}
              </Space>
            </Card>
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
