import { Modal, Row, Col, Input, Spin, message, Form } from 'antd';
import * as React from 'react';
import { CourseService } from 'services/course';

type Props = {
  visible: boolean;
  githubId?: string;
  courseId: number;
  onCancel: () => void;
  onOk: () => void;
};

export class StudentExpelModal extends React.PureComponent<Props, { isLoading: boolean }> {
  state = { isLoading: false };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.courseId);
  }

  render() {
    return (
      <Modal
        title="Expel Student"
        visible={this.props.visible && !!this.props.githubId}
        okText="Expel"
        okButtonProps={{ type: 'danger' }}
        onOk={this.handleExpelStudent}
        onCancel={this.props.onCancel}
      >
        <Form layout="vertical" initialValues={{ comment: '' }}>
          <Spin spinning={this.state.isLoading}>
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

  private handleExpelStudent = async values => {
    if (!this.props.githubId) {
      return;
    }
    try {
      this.setState({ isLoading: true });
      await this.courseService.expelStudent(this.props.githubId, values.comment);
      this.setState({ isLoading: false });
      this.props.onOk();
    } catch (e) {
      this.setState({ isLoading: false });
      message.error('An error occurred.');
    }
  };
}
