import { Form, Row, Col } from 'antd';
import { ModalForm } from './Forms';
import { MentorSearch } from './MentorSearch';

type Props = {
  visible: boolean;
  courseId: number;
  onCancel: () => void;
  onOk: (githubId: string) => void;
};

export function SelectMentorModal(props: Props) {
  const handleSubmit = async (values: any) => {
    props.onOk(values.githubId);
  };

  return (
    <ModalForm title="Mentor" data={props.visible ? {} : null} submit={handleSubmit} cancel={props.onCancel}>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="githubId" rules={[{ required: true, message: 'Please select  mentor' }]} label="Mentor">
            <MentorSearch keyField="githubId" courseId={props.courseId} />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
}
