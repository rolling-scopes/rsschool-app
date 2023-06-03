import { Form, Row, Col } from 'antd';
import { StudentSearch } from './StudentSearch';
import { ModalForm } from './Forms';
import { MentorSearch } from './MentorSearch';

type Props = {
  visible: boolean;
  courseId: number;
  onCancel: () => void;
  onOk: (studentGithubId: string, mentorGithubId: string) => void;
};

export function StudentMentorModal(props: Props) {
  const handleSubmit = async (values: any) => {
    props.onOk(values.studentGithubId, values.mentorGithubId);
  };

  return (
    <ModalForm title="Student/Mentor" data={props.visible ? {} : null} submit={handleSubmit} cancel={props.onCancel}>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item
            name="studentGithubId"
            rules={[{ required: true, message: 'Please select student' }]}
            label="Student"
          >
            <StudentSearch keyField="githubId" courseId={props.courseId} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item
            name="mentorGithubId"
            rules={[{ required: true, message: 'Please select  mentor' }]}
            label="Mentor"
          >
            <MentorSearch keyField="githubId" courseId={props.courseId} />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
}
