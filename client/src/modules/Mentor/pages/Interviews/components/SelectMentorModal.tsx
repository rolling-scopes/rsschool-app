import { Form, Row, Col, Select } from 'antd';
import { ModalForm } from 'components/Forms';
import { GithubAvatar } from 'components/GithubAvatar';
import { MentorSearch } from 'components/MentorSearch';
import { MentorInterview } from 'services/course';

type Props = {
  interviews: MentorInterview[];
  courseId: number;
  onCancel: () => void;
  onOk: (githubId: string, interviewId: number) => void;
};

export function SelectMentorModal(props: Props) {
  const { courseId, onCancel, onOk, interviews } = props;

  return (
    <ModalForm title="Mentor" data={{}} submit={onSubmit} cancel={onCancel}>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="interviewId" rules={[{ required: true, message: 'Please select  student' }]} label="Student">
            <Select showSearch allowClear placeholder="'Select...">
              {interviews.map(({ id, student }) => {
                return (
                  <Select.Option key={id} value={id}>
                    <GithubAvatar size={24} githubId={student.githubId} /> {student.name || student.githubId}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="githubId" rules={[{ required: true, message: 'Please select  mentor' }]} label="Mentor">
            <MentorSearch keyField="githubId" courseId={courseId} />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );

  function onSubmit(values: { githubId: string; interviewId: number }) {
    onOk(values.githubId, values.interviewId);
  }
}
