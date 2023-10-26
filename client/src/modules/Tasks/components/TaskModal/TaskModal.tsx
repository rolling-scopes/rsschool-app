import { Row, Col, Form, Input, Select, Card, Space, Tag, Empty, Typography } from 'antd';
import { useMemo } from 'react';
import { union } from 'lodash';
import { TaskDto, CriteriaDto, DisciplineDto } from 'api';
import { ModalForm } from 'components/Forms';
import { SKILLS } from 'data/skills';
import { TASK_TYPES } from 'data/taskTypes';
import { TaskSettings } from 'modules/Tasks/components';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS } from 'modules/Tasks/constants';
import { ModalData } from 'modules/Tasks/types';
import { urlPattern } from 'services/validators';

const { Text } = Typography;

export type ModalProps = {
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
          <Form.Item name="name" label={LABELS.name} rules={[{ required: true, message: ERROR_MESSAGES.name }]}>
            <Input placeholder={PLACEHOLDERS.name} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="type" label={LABELS.taskType} rules={[{ required: true, message: ERROR_MESSAGES.taskType }]}>
            <Select
              placeholder={PLACEHOLDERS.taskType}
              options={TASK_TYPES.map(({ id, name }) => ({ value: id, label: name }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="discipline"
            label={LABELS.discipline}
            rules={[{ required: true, message: ERROR_MESSAGES.discipline }]}
          >
            <Select
              placeholder={PLACEHOLDERS.discipline}
              options={disciplines.map(({ id, name }) => ({ value: id, label: name }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="tags" label={LABELS.tags}>
            <Select
              mode="tags"
              placeholder={PLACEHOLDERS.tags}
              options={allTags.map(tag => ({ value: tag, label: tag }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="descriptionUrl"
        label={LABELS.descriptionUrl}
        rules={[
          {
            required: true,
            message: ERROR_MESSAGES.descriptionUrl,
          },
          {
            message: ERROR_MESSAGES.validUrl,
            pattern: urlPattern,
          },
        ]}
      >
        <Input placeholder={PLACEHOLDERS.descriptionUrl} />
      </Form.Item>
      <Form.Item name="description" label={LABELS.summary}>
        <Input placeholder={PLACEHOLDERS.summary} />
      </Form.Item>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="skills" label={LABELS.skills}>
            <Select
              mode="tags"
              placeholder={PLACEHOLDERS.skills}
              options={allSkills.map(tag => ({ value: tag, label: tag }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 24 }}>
            <Text>{LABELS.usedInCourses}</Text>
            <Card bodyStyle={{ padding: 8 }}>
              {modalData?.courses?.length ? (
                <Space size={[0, 8]} wrap>
                  {modalData.courses.map(({ name, isActive }) => (
                    <Tag key={name} color={isActive ? 'blue' : ''}>
                      {name}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
      <TaskSettings dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} />
    </ModalForm>
  );
}

function getInitialValues(modalData: Partial<TaskDto>) {
  return { ...modalData, discipline: modalData.discipline?.id };
}
