import { Alert, Checkbox, Form, message, Select, Space } from 'antd';
import { InviteMentorsDto } from 'api';
import { ModalForm } from 'components/Forms';
import { useLoading } from 'components/useLoading';
import ReactQuill from 'react-quill';
import { MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'services/models';

import 'react-quill/dist/quill.snow.css';

type Props = {
  courses: Course[];
  onCancel: () => void;
};
const mentorRegistryService = new MentorRegistryService();

function InviteMentorsModal({ courses, onCancel }: Props) {
  const [loading, withLoading] = useLoading(false);
  const submit = withLoading(async (data: InviteMentorsDto) => {
    await mentorRegistryService.inviteMentors(data);
    message.success('Invitation successfully send.');
    onCancel();
  });

  return (
    <ModalForm data={{}} title="Invite as a Mentor" submit={submit} cancel={onCancel} loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert showIcon message="Invitation will be send to all mentors meeting the criteria below." type="info" />
        <Form.Item
          name="preselectedCourses"
          label="Pre-Selected Courses"
          style={formItemStyle}
          rules={[{ required: true, message: 'Please select courses.' }]}
        >
          <Select mode="multiple" optionFilterProp="children">
            {courses.map(course => (
              <Select.Option key={course.id} value={course.id}>
                {course.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="certificate" style={formItemStyle} initialValue={false}>
          <Checkbox>Completed with certificate</Checkbox>
        </Form.Item>
        <Form.Item name="mentor" style={formItemStyle} initialValue={false}>
          <Checkbox>Mentor in the Past</Checkbox>
        </Form.Item>
        <Form.Item
          name="text"
          label="Invitation Text"
          style={formItemStyle}
          rules={[{ required: true, message: 'Please add invitation text.' }]}
        >
          <ReactQuill theme="snow" placeholder="Write an invitation message" />
        </Form.Item>
      </Space>
    </ModalForm>
  );
}

const formItemStyle = { marginBottom: 0 };

export default InviteMentorsModal;
