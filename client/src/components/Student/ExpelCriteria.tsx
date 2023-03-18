import { Form, Input, InputNumber, Select, Alert, Checkbox, Modal, Row, Col, Button, Space } from 'antd';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { CoursesTasksApi } from 'api';

type Props = {
  courseId: number;
  onApply: (
    criteria: { courseTaskIds: number[]; minScore: number },
    options: { keepWithMentor: boolean },
    expellingReason: string,
  ) => void;
  onClose: () => void;
  isModalOpen: boolean;
};

type FormValues = {
  courseTaskIds: number[];
  minScore: number;
  keepWithMentor: boolean;
  reason: string;
};

const courseTasksApi = new CoursesTasksApi();

export function ExpelCriteria({ courseId, onApply, onClose, isModalOpen }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [okEnabled, setOkEnabled] = useState(false);

  const { value: courseTasks = [], loading } = useAsync(async () => {
    const { data } = await courseTasksApi.getCourseTasks(courseId);
    return data;
  }, []);

  return (
    <Modal
      width={600}
      title="Expel Criteria"
      onCancel={onClose}
      open={isModalOpen}
      bodyStyle={{ paddingBlock: 16 }}
      footer={null}
    >
      <Form
        layout="vertical"
        form={form}
        onValuesChange={(changes, values) => {
          const { minScore, courseTaskIds } = values;
          const formChanges = changes;
          if (formChanges.minScore === undefined && formChanges.courseTaskIds === undefined) {
            return;
          }
          setOkEnabled(!!minScore || (Array.isArray(courseTaskIds) && courseTaskIds.length > 0));
        }}
        onFinish={({ minScore, keepWithMentor, courseTaskIds, reason }) => {
          onApply({ courseTaskIds, minScore }, { keepWithMentor }, reason);
        }}
      >
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Alert
              type="warning"
              message="All students meeting the criteria below will be expelled from the course."
              showIcon
            />
          </Col>
          <Col span={24}>
            <Form.Item
              name="courseTaskIds"
              label="Didn't Complete Following Tasks"
              required
              style={{ marginBottom: 0 }}
            >
              <Select
                mode="multiple"
                placeholder="Select tasks"
                loading={loading}
                optionFilterProp="label"
                options={courseTasks.map(({ name, id }) => ({
                  label: name,
                  value: id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="minScore" label="Score Per Task Less Than" style={{ marginBottom: 0 }}>
              <InputNumber style={{ width: '100%' }} type="number" min={0} placeholder="Enter minimum score" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="keepWithMentor" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox>Don't expel students with assigned mentor</Checkbox>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="reason"
              rules={[{ required: true, message: 'Please provide the expel reason' }]}
              label="Expel Reason"
            >
              <Input.TextArea placeholder="Specify the student expel reason" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Row justify="end">
              <Space wrap>
                <Button key="back" onClick={onClose}>
                  Cancel
                </Button>
                <Button key="submit" type="primary" htmlType="submit" disabled={!okEnabled} danger>
                  Expel Students
                </Button>
              </Space>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
