import { Form, Input, InputNumber, Select, Alert, Checkbox, Modal, Row, Col, Button, Space } from 'antd';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { CoursesTasksApi } from 'api';

type FormValues = {
  courseTaskIds: number[];
  minScore: number;
  keepWithMentor: boolean;
  reason: string;
};

type Criteria = Partial<FormValues> & { reason: string };

type Props = {
  courseId: number;
  onSubmit: (expelCriteria: Criteria) => void;
  onClose: () => void;
  isModalOpen: boolean;
};

const courseTasksApi = new CoursesTasksApi();

export function ExpelCriteria({ courseId, onSubmit, onClose, isModalOpen }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [okEnabled, setOkEnabled] = useState(false);

  const { value: courseTasks = [], loading } = useAsync(async () => {
    const { data } = await courseTasksApi.getCourseTasks(courseId);
    return data;
  }, []);

  const hasValidCriteria = (values: FormValues) => {
    const { minScore, courseTaskIds } = values;

    return !!minScore || (Array.isArray(courseTaskIds) && courseTaskIds.length > 0);
  };

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
        onValuesChange={(_, values) => {
          setOkEnabled(hasValidCriteria(values));
        }}
        onFinish={onSubmit}
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
            <Form.Item name="courseTaskIds" label="Didn't Complete Following Tasks" style={{ marginBottom: 0 }}>
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
            <Form.Item name="minScore" label="Minimum Total Score" style={{ marginBottom: 0 }}>
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
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" htmlType="submit" disabled={!okEnabled} danger>
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
