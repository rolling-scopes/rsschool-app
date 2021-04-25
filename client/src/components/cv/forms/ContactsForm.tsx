import * as React from 'react';
import { Form, Input, Card } from 'antd';
import { Contacts } from '../../../../../common/models/cv';

const { Item } = Form;

type Props = {
  contactsList: Contacts;
};

const ContactsForm = React.forwardRef((props: Props, ref: any) => {
  const { contactsList } = props;

  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(contactsList);
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
          rules={[{ max: 15, whitespace: false }]}
        >
          <Input placeholder="Phone number" />
        </Item>
        <Item
          style={itemStyle}
          label="Email"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="email"
          rules={[{ max: 50, whitespace: false }]}
        >
          <Input placeholder="Email" />
        </Item>
        <Item
          style={itemStyle}
          label="Skype id"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="skype"
          rules={[{ max: 30, whitespace: false }]}
        >
          <Input placeholder="Skype id" />
        </Item>
        <Item
          style={itemStyle}
          label="Telegram public name"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="telegram"
          rules={[{ max: 30, whitespace: false }]}
        >
          <Input placeholder="Telegram public name" />
        </Item>
        <Item
          style={itemStyle}
          label="LinkedIn username"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="linkedin"
          rules={[{ max: 30, whitespace: false }]}
        >
          <Input placeholder="LinkedIn username" />
        </Item>
        <Item
          style={itemStyle}
          label="Location"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="location"
          rules={[{ max: 100, whitespace: false }]}
        >
          <Input placeholder="The location in which you want to work" />
        </Item>
        <Item
          style={itemStyle}
          label="Github username"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="github"
          rules={[{ max: 30, whitespace: false }]}
        >
          <Input placeholder="Github username" />
        </Item>
        <Item
          style={itemStyle}
          label="Website"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="website"
          rules={[{ max: 100, whitespace: false }]}
        >
          <Input placeholder="For example, a link to a portfolio or something like that" />
        </Item>
      </Form>
    </Card>
  );
});

export default ContactsForm;
