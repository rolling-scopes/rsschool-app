import { Form, Checkbox, Typography } from 'antd';
import { ERROR_MESSAGES, DATA_PROCESSING_TEXT, TAIL_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';

const { Text } = Typography;

type Props = {
  isStudentForm?: boolean;
};

export function DataProcessingCheckbox({ isStudentForm }: Props) {
  return (
    <Form.Item
      {...TAIL_FORM_ITEM_LAYOUT(!isStudentForm)}
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
