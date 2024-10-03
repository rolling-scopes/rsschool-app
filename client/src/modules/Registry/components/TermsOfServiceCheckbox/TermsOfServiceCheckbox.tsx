import { Form, Checkbox, Typography } from 'antd';
import { ERROR_MESSAGES, TERMS_OF_SERVICE_TEXT, TAIL_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';

const { Text } = Typography;

type Props = {
  isStudentForm?: boolean;
};

export function TermsOfServiceCheckbox({ isStudentForm }: Props) {
  return (
    <Form.Item
      {...TAIL_FORM_ITEM_LAYOUT(!isStudentForm)}
      name="termsOfService"
      valuePropName="checked"
      rules={[
        {
          validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error(ERROR_MESSAGES.shouldAgreeTerms))),
        },
      ]}
    >
      <Checkbox>
        <Text type="secondary">{TERMS_OF_SERVICE_TEXT}</Text>
      </Checkbox>
    </Form.Item>
  );
}
