import { forwardRef, useEffect, ForwardedRef } from 'react';
import { Form, Input, Card, FormInstance, Typography } from 'antd';
import { Contacts } from 'modules/Opportunities/models';
import { contactsValidationRules as validationRules } from '../form-validation';

const { Item } = Form;
const { Text } = Typography;

type Props = {
  contactsList: Contacts;
};

export const ContactsForm = forwardRef((props: Props, ref: ForwardedRef<FormInstance>) => {
  const { contactsList } = props;

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(contactsList);
    form.validateFields();
  }, [contactsList]);

  const inputStyle = {
    maxWidth: '400px',
  };

  return (
    <Card title={<Text strong>Contacts</Text>} style={{ width: '70vw', marginBottom: '20px' }}>
      <Form
        form={form}
        ref={ref}
        name="contacts"
        labelCol={{ span: 9 }}
        wrapperCol={{ span: 10 }}
        style={{ width: '100%' }}
      >
        <Item label="Phone" name="phone" rules={[...validationRules['phone']]}>
          <Input style={inputStyle} placeholder="+12025550111" />
        </Item>
        <Item label="Email" name="email" rules={[...validationRules['email']]}>
          <Input style={inputStyle} placeholder="Email" />
        </Item>
        <Item label="Skype" name="skype" rules={[...validationRules['skype']]}>
          <Input style={inputStyle} placeholder="Skype id" />
        </Item>
        <Item label="Telegram" name="telegram" rules={[...validationRules['telegram']]}>
          <Input style={inputStyle} placeholder="Telegram public name" />
        </Item>
        <Item label="LinkedIn" name="linkedin" rules={[...validationRules['linkedin']]}>
          <Input style={inputStyle} placeholder="LinkedIn username" />
        </Item>
        <Item label="Github" name="githubUsername" rules={[...validationRules['github']]}>
          <Input style={inputStyle} placeholder="Github username" />
        </Item>
        <Item label="Website" name="website" rules={[...validationRules['website']]}>
          <Input style={inputStyle} placeholder="Enter your website URL" />
        </Item>
      </Form>
    </Card>
  );
});
