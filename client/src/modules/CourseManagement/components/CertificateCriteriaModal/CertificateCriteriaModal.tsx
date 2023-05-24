import { Alert, Button, Col, Form, InputNumber, Modal, Row, Space } from 'antd';
import { useState } from 'react';
import { SelectCourseTasks } from 'modules/CourseManagement/components';

type FormValues = {
  courseTaskIds: number[];
  minScore: number;
  minTotalScore: number;
};

type Criteria = Partial<FormValues>;

type Props = {
  courseId: number;
  onSubmit: (criteria: Criteria) => void;
  onClose: () => void;
  isModalOpen: boolean;
};

export function CertificateCriteriaModal({ courseId, onSubmit, onClose, isModalOpen }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [okEnabled, setOkEnabled] = useState(false);

  const hasValidCriteria = (values: FormValues) => {
    const { minScore, courseTaskIds, minTotalScore } = values;
    const tasksCriteriaValid = !courseTaskIds || !courseTaskIds.length || (courseTaskIds.length > 0 && !!minScore);

    return tasksCriteriaValid && !!minTotalScore;
  };

  return (
    <Modal
      width={600}
      title="Certificate Criteria"
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
            <Alert message="Certificates will be issued to all students meeting the criteria down below." showIcon />
          </Col>
          <Col span={24}>
            <Form.Item name="courseTaskIds" label="Tasks" style={{ marginBottom: 0 }}>
              <SelectCourseTasks courseId={courseId} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="minScore" label="Minimum Score Per Task" style={{ marginBottom: 0 }}>
              <InputNumber style={{ width: '100%' }} type="number" min={0} placeholder="Enter minimum score" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="minTotalScore" label="Minimum Total Score" style={{ marginBottom: 0 }}>
              <InputNumber style={{ width: '100%' }} type="number" min={0} placeholder="Enter minimum score" />
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
