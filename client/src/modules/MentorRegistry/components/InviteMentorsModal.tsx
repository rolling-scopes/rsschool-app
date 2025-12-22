import { Alert, Checkbox, Form, Select, Space, Spin } from 'antd';
import { useAsync } from 'react-use';
import { InviteMentorsDto } from '@client/api';
import { ModalForm } from '@client/shared/components/Forms';
import { useLoading } from 'components/useLoading';
import ReactQuill from 'react-quill';
import { MentorRegistryService } from 'services/mentorRegistry';
import { DisciplinesApi } from '@client/api';

import 'react-quill/dist/quill.snow.css';
import { useMessage } from 'hooks';

type Props = {
  onCancel: () => void;
};
const mentorRegistryService = new MentorRegistryService();
const disciplinesApi = new DisciplinesApi();

function InviteMentorsModal({ onCancel }: Props) {
  const { message } = useMessage();
  const [loading, withLoading] = useLoading(false);
  const submit = withLoading(async (data: InviteMentorsDto) => {
    await mentorRegistryService.inviteMentors(data);
    message.success('Invitation successfully send.');
    onCancel();
  });

  const { loading: disciplinesLoading, value: disciplines = [] } = useAsync(async () => {
    const { data } = await disciplinesApi.getDisciplines();
    return data;
  }, []);

  return (
    <ModalForm data={{}} title="Invite as a Mentor" submit={submit} cancel={onCancel} loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert showIcon message="Invitation will be send to all mentors meeting the criteria below." type="info" />
        <Form.Item
          name="disciplines"
          label="Disciplines"
          style={formItemStyle}
          rules={[{ required: true, message: 'Please select disciplines.' }]}
        >
          <Select
            mode="multiple"
            optionFilterProp="children"
            notFoundContent={disciplinesLoading ? <Spin size="small" /> : null}
          >
            {disciplines.map(discipline => (
              <Select.Option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="isMentor" style={formItemStyle} valuePropName="checked">
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
