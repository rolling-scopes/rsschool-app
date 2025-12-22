import { Col, Form, Input, Row } from 'antd';
import { ModalForm } from '@client/shared/components/Forms';
import { DiscordServerDto, UpdateDiscordServerDto } from '@client/api';

type Props = {
  data: Partial<DiscordServerDto> | null;
  title: string;
  submit: (values: UpdateDiscordServerDto) => Promise<void>;
  cancel: () => void;
  getInitialValues: (data: Partial<DiscordServerDto>) => any;
  loading: boolean;
};

export function DiscordServersModal({ data, title, submit, cancel, getInitialValues, loading }: Props) {
  return data ? (
    <ModalForm
      data={data}
      title={title}
      submit={submit}
      cancel={cancel}
      getInitialValues={getInitialValues}
      loading={loading}
    >
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter server name' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="gratitudeUrl"
            label="Gratitude URL"
            rules={[{ required: true, message: 'Please enter gratitude URL' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="mentorsChatUrl"
            label="Mentors chat URL"
            rules={[{ required: true, message: 'Please enter mentors chat URL' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  ) : null;
}
