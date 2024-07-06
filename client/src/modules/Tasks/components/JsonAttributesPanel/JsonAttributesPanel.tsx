import { Form, Input } from 'antd';
import { ERROR_MESSAGES, PLACEHOLDERS } from 'modules/Tasks/constants';

export function JsonAttributesPanel() {
  return (
    <Form.Item
      name="attributes"
      rules={[
        {
          validator: async (_, value: string) => (value ? JSON.parse(value) : Promise.resolve()),
          message: ERROR_MESSAGES.invalidJson,
        },
      ]}
    >
      <Input.TextArea rows={6} placeholder={PLACEHOLDERS.jsonAttributes} />
    </Form.Item>
  );
}
