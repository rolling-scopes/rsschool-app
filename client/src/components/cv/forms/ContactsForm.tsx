import * as React from 'react';
import { Form, Input, Button } from 'antd';
import { Contacts } from '../../../../../common/models/cv';

const { Item } = Form;

type Props = {
  contactsList: Contacts;
  handleFunc: (data: any) => void;
};

export default function ContactsForm(props: Props) {
  const { contactsList, handleFunc } = props;

  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(contactsList);
  });

  return (
    <Form form={form} name="contacts" onFinish={handleFunc}>
      <Item label="Phone" name="phone" rules={[{ max: 15, whitespace: false }]}>
        <Input />
      </Item>
      <Item label="Email" name="email" rules={[{ max: 50, whitespace: false }]}>
        <Input />
      </Item>
      <Item label="Skype" name="skype" rules={[{ max: 30, whitespace: false }]}>
        <Input />
      </Item>
      <Item label="Telegram" name="telegram" rules={[{ max: 30, whitespace: false }]}>
        <Input />
      </Item>
      <Item label="LinkedIn" name="linkedin" rules={[{ max: 30, whitespace: false }]}>
        <Input />
      </Item>
      <Item label="Location" name="location" rules={[{ max: 100, whitespace: false }]}>
        <Input />
      </Item>
      <Item label="Github" name="github" rules={[{ max: 30, whitespace: false }]}>
        <Input />
      </Item>
      <Item label="Website" name="website" rules={[{ max: 100, whitespace: false }]}>
        <Input />
      </Item>
      <Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Item>
      <Item>
        <Button type="primary" htmlType="submit" onClick={() => form.resetFields()}>
          Reset
        </Button>
      </Item>
    </Form>
  );
}
