import * as React from 'react';
import { Form, Input, Card } from 'antd';
import { Contacts } from '../../../../../common/models/cv';
import { Rule } from 'rc-field-form/lib/interface';

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

  const validationMessages = {
    required: "Field can't be empty",
    min: (length: number): string => `Mininal text length is ${length}`,
    max: (length: number): string => `Maximal text length is ${length}`,
    whitespace: "Field can't contain only whitespaces",
  };

  const validationRules: {
    [key: string]: Rule[];
  } = {
    phone: [
      {
        max: 15,
        message: validationMessages.max(15),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    email: [
      {
        max: 50,
        message: validationMessages.max(50),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    skype: [
      {
        max: 30,
        message: validationMessages.max(30),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    telegram: [
      {
        max: 30,
        message: validationMessages.max(30),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    linkedin: [
      {
        max: 30,
        message: validationMessages.max(30),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    location: [
      {
        max: 100,
        message: validationMessages.max(100),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    github: [
      {
        max: 30,
        message: validationMessages.max(30),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    website: [
      {
        max: 100,
        message: validationMessages.max(100),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
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
          label="LinkedIn username"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="linkedin"
          rules={[...validationRules['linkedin']]}
        >
          <Input placeholder="LinkedIn username" />
        </Item>
        <Item
          style={itemStyle}
          label="Location"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="location"
          rules={[...validationRules['location']]}
        >
          <Input placeholder="The location in which you want to work" />
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
