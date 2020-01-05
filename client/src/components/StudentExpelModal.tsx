import { Col, Form, Input, message, Modal, Row, Spin } from 'antd';
import { useState } from 'react';
import { CourseService } from 'services/course';

type Props = {
  visible: boolean;
  githubId?: string;
  courseId: number;
  onCancel: () => void;
  onOk: () => void;
};

export function StudentExpelModal(props: Props) {
  const courseService = new CourseService(props.courseId);
  const [loading, setLoading] = useState(false);

  const handleExpelStudent = async values => {
    if (!props.githubId) {
      return;
    }
    try {
      setLoading(true);
      await courseService.expelStudent(props.githubId, values.comment);
      setLoading(false);
      props.onOk();
    } catch (e) {
      setLoading(false);
      message.error('An error occurred.');
    }
  };

  return (
    <Modal
      title="Expel Student"
      visible={props.visible && !!props.githubId}
      okText="Expel"
      okButtonProps={{ type: 'danger' }}
      onOk={handleExpelStudent}
      onCancel={props.onCancel}
    >
      <Form layout="vertical" initialValues={{ comment: '' }}>
        <Spin spinning={loading}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item name="comment" rules={[{ required: true, message: 'Please enter comment' }]} label="Comment">
                <Input.TextArea style={{ height: 200 }} />
              </Form.Item>
            </Col>
          </Row>
        </Spin>
      </Form>
    </Modal>
  );
}
