import { Alert, Button, Col, Form, InputNumber, Modal, Row, Select, Space, Table } from 'antd';
import MinusCircleOutlined from '@ant-design/icons/MinusCircleOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CoursesTasksApi } from '@client/api';
import { CertificateTemplatePicker } from '../CertificateTemplatePicker/CertificateTemplatePicker';

export type TaskCriteria = {
  courseTaskId: number;
  minScore: number;
};

export type FormValues = {
  taskCriteria?: Partial<TaskCriteria>[];
  minTotalScore: number;
  templateId: string;
};

type Criteria = {
  taskCriteria?: TaskCriteria[];
  minTotalScore?: number;
  templateId?: string;
};

type Props = {
  courseId: number;
  onSubmit: (criteria: Criteria) => void;
  onClose: () => void;
  isModalOpen: boolean;
};

export const CERTIFICATE_ALERT_MESSAGE = 'Certificates will be issued to all students meeting the criteria down below.';

const courseTasksApi = new CoursesTasksApi();

export function CertificateCriteriaModal({ courseId, onSubmit, onClose, isModalOpen }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [okEnabled, setOkEnabled] = useState(false);

  const { value: courseTasks = [], loading } = useAsync(async () => {
    const { data } = await courseTasksApi.getCourseTasks(courseId);
    return data;
  }, [courseId]);

  const maxScoreByTaskId = useMemo(
    () => new Map<number, number>(courseTasks.map(task => [task.id, task.maxScore])),
    [courseTasks],
  );

  const handleFinish = ({ taskCriteria, minTotalScore, templateId }: FormValues) => {
    onSubmit({
      taskCriteria: (taskCriteria ?? []).flatMap(row =>
        row?.courseTaskId != null && row.minScore != null
          ? [{ courseTaskId: row.courseTaskId, minScore: row.minScore }]
          : [],
      ),
      minTotalScore,
      templateId,
    });
  };

  return (
    <Modal
      width={600}
      title="Certificate Criteria"
      onCancel={onClose}
      open={isModalOpen}
      styles={{ body: { paddingBlock: 16 } }}
      footer={null}
    >
      <Form
        layout="vertical"
        form={form}
        onValuesChange={(_, values) => {
          setOkEnabled(hasValidCriteria(values));
        }}
        onFinish={handleFinish}
      >
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Alert title={CERTIFICATE_ALERT_MESSAGE} showIcon />
          </Col>
          <Col span={24}>
            <Form.List name="taskCriteria">
              {(fields, { add, remove }) => {
                const columns = [
                  {
                    title: 'Task',
                    key: 'task',
                    width: '55%',
                    render: (_: unknown, field: (typeof fields)[number]) => (
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev: FormValues, curr: FormValues) => prev?.taskCriteria !== curr?.taskCriteria}
                      >
                        {({ getFieldValue }) => {
                          const rows = (getFieldValue('taskCriteria') ?? []) as Partial<TaskCriteria>[];
                          const selectedIds = new Set(
                            rows.flatMap((row, index) =>
                              index !== field.name && row?.courseTaskId != null ? [row.courseTaskId] : [],
                            ),
                          );
                          return (
                            <Form.Item
                              name={[field.name, 'courseTaskId']}
                              rules={[{ required: true, message: 'Select a task' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                showSearch
                                placeholder="Select task"
                                loading={loading}
                                optionFilterProp="label"
                                options={courseTasks.map(({ name, id, maxScore }) => ({
                                  label: maxScore != null ? `${name} (max ${maxScore})` : name,
                                  value: id,
                                  disabled: selectedIds.has(id),
                                }))}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'Minimum Score',
                    key: 'minScore',
                    width: '35%',
                    render: (_: unknown, field: (typeof fields)[number]) => (
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev: FormValues, curr: FormValues) =>
                          prev?.taskCriteria?.[field.name]?.courseTaskId !==
                          curr?.taskCriteria?.[field.name]?.courseTaskId
                        }
                      >
                        {({ getFieldValue }) => {
                          const taskId = getFieldValue(['taskCriteria', field.name, 'courseTaskId']) as
                            | number
                            | undefined;
                          const max = taskId != null ? maxScoreByTaskId.get(taskId) : undefined;
                          return (
                            <Form.Item
                              name={[field.name, 'minScore']}
                              rules={[
                                { required: true, message: 'Enter minimum score' },
                                {
                                  type: 'number',
                                  max,
                                  message: max != null ? `Max ${max}` : undefined,
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber min={1} max={max} placeholder="Min score" style={{ width: '100%' }} />
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    ),
                  },
                  {
                    title: '',
                    key: 'actions',
                    width: '10%',
                    render: (_: unknown, field: (typeof fields)[number]) => (
                      <Button
                        type="text"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                        aria-label="Remove task"
                      />
                    ),
                  },
                ];

                return (
                  <>
                    {fields.length > 0 && (
                      <Table
                        rowKey="key"
                        size="small"
                        pagination={false}
                        dataSource={fields}
                        columns={columns}
                        style={{ marginBottom: 16 }}
                      />
                    )}
                    <Button onClick={() => add({})} icon={<PlusOutlined />} block>
                      Add task
                    </Button>
                  </>
                );
              }}
            </Form.List>
          </Col>
          <Col span={24}>
            <Form.Item name="minTotalScore" label="Minimum Total Score" style={{ marginBottom: 0 }}>
              <InputNumber style={{ width: '100%' }} type="number" min={0} placeholder="Enter minimum score" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="templateId" label="Certificate Template" style={{ marginBottom: 0 }}>
              <CertificateTemplatePicker />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Row justify="end">
              <Space wrap>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" htmlType="submit" disabled={!okEnabled}>
                  Issue Certificates
                </Button>
              </Space>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export function hasValidCriteria({ taskCriteria, minTotalScore }: FormValues) {
  const rows = taskCriteria ?? [];
  const tasksCriteriaValid = rows.every(row => row?.courseTaskId != null && !!row?.minScore);
  const hasAnyCriteria = rows.length > 0 || !!minTotalScore;

  return tasksCriteriaValid && hasAnyCriteria;
}
