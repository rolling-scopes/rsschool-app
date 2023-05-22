import { Form, Checkbox, Typography } from 'antd';
import { ERROR_MESSAGES, DATA_PROCESSING_TEXT } from 'modules/Registry/constants';

const { Text } = Typography;

export function DataProcessingCheckbox() {
  return (
    <Form.Item
      wrapperCol={{ lg: { span: 16, offset: 4 } }}
      name="dataProcessing"
      valuePropName="checked"
      rules={[
        {
          validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error(ERROR_MESSAGES.shouldAgree))),
        },
      ]}
    >
      <Checkbox>
        <Text type="secondary">{DATA_PROCESSING_TEXT}</Text>
      </Checkbox>
    </Form.Item>
  );
}
