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
      <Item label="Phone" name="phone">
        <Input />
      </Item>
      <Item label="Email" name="email">
        <Input />
      </Item>
      <Item label="Skype" name="skype">
        <Input />
      </Item>
      <Item label="Telegram" name="telegram">
        <Input />
      </Item>
      <Item label="LinkedIn" name="linkedin">
        <Input />
      </Item>
      <Item label="Location" name="location">
        <Input />
      </Item>
      <Item label="Github" name="github">
        <Input />
      </Item>
      <Item label="Website" name="website">
        <Input />
      </Item>
      <Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Item>
    </Form>
  );
}
