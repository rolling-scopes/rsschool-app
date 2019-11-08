import { Modal, Row, Col, Input, Spin, message, Form } from 'antd';
import * as React from 'react';
import { CourseService } from 'services/course';
import { FormComponentProps } from 'antd/lib/form';

type Props = {
  visible: boolean;
  studentId: number;
  courseId: number;
  onCancel: () => void;
  onOk: () => void;
} & FormComponentProps;

class ExpelModal extends React.PureComponent<Props, { isLoading: boolean }> {
  private courseService: CourseService = new CourseService();

  state = {
    isLoading: false,
  };

  render() {
    const { getFieldDecorator: field } = this.props.form;
    return (
      <Modal
        title="Expel Student"
        visible={this.props.visible}
        okText="Expel"
        okButtonProps={{ type: 'danger' }}
        onOk={this.handleExpelStudent}
        onCancel={this.props.onCancel}
      >
        <Form layout="vertical">
          <Spin spinning={this.state.isLoading}>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label="Comment">
                  {field('comment', {
                    initialValue: '',
                    rules: [{ required: true, message: 'Please enter comment' }],
                  })(<Input.TextArea style={{ height: 200 }} />)}
                </Form.Item>
              </Col>
            </Row>
          </Spin>
        </Form>
      </Modal>
    );
  }

  private handleExpelStudent = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      try {
        this.setState({ isLoading: true });
        await this.courseService.expelStudent(this.props.courseId, this.props.studentId, values.comment);
        this.setState({ isLoading: false });
        this.props.onOk();
      } catch (e) {
        this.setState({ isLoading: false });
        message.error('An error occurred.');
      }
    });
  };
}

const StudentExpelModal = Form.create<Props>()(ExpelModal);
export { StudentExpelModal };
