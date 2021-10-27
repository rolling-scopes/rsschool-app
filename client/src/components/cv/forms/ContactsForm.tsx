import * as React from 'react';
import { Form, Input, Card } from 'antd';
import { Contacts } from 'modules/Opportunities/models';
import { contactsValidationRules as validationRules } from './form-validation';

const { Item } = Form;
const { TextArea } = Input;

type Props = {
  contactsList: Contacts;
};

const ContactsForm = React.forwardRef((props: Props, ref: any) => {
  const { contactsList } = props;

  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(contactsList);
    form.validateFields();
  }, [contactsList]);

  const itemStyle = {
    maxWidth: '310px',
  };

  return (
    <Card title="Contacts">
      <Form form={form} ref={ref} name="contacts">
        <Item
          style={itemStyle}
          label="Phone"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="phone"
          rules={[...validationRules['phone']]}
        >
          <Input placeholder="Phone number" />
        </Item>
        <Item
          style={itemStyle}
          label="Email"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="email"
          rules={[...validationRules['email']]}
        >
          <Input placeholder="Email" />
        </Item>
        <Item
          style={itemStyle}
          label="Skype id"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="skype"
          rules={[...validationRules['skype']]}
        >
          <Input placeholder="Skype id" />
        </Item>
        <Item
          style={itemStyle}
          label="Telegram public name"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="telegram"
          rules={[...validationRules['telegram']]}
        >
          <Input placeholder="Telegram public name" />
        </Item>
        <Item
          style={itemStyle}
          label="LinkedIn Profile"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="linkedin"
          rules={[...validationRules['linkedin']]}
        >
          <Input placeholder="LinkedIn username" />
        </Item>
        <Item
          style={itemStyle}
          label="Locations (each from new line)"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="locations"
          rules={[...validationRules['locations']]}
        >
          <TextArea
            rows={4}
            placeholder="The locations in which you want to work (maximum 3, separated by semicolons)"
          />
        </Item>
        <Item
          style={itemStyle}
          label="Github username"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="github"
          rules={[...validationRules['github']]}
        >
          <Input placeholder="Github username" />
        </Item>
        <Item
          style={itemStyle}
          label="Website"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="website"
          rules={[...validationRules['website']]}
        >
          <Input placeholder="For example, a link to a portfolio or something like that" />
        </Item>
      </Form>
    </Card>
  );
});

export default ContactsForm;
