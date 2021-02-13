import * as React from 'react';
import { Form, Input } from 'antd';
import FormCV from '../FormCV';
import { Contacts } from '../../../../../common/models/cv';

const { Item } = Form;

type Props = {
  contactsList: Contacts;
  handleFunc: (data: any) => void;
};

export default function UserDataForm(props: Props) {
  const { contactsList, handleFunc } = props;


  const content = (
    <>
      <Item label="Phone" wrapperCol={{span: 24}} labelCol={{span: 24}} name="phone" rules={[{ max: 15, whitespace: false }]}>
        <Input placeholder="Phone number" />
      </Item>
      <Item label="Email" wrapperCol={{span: 24}} labelCol={{span: 24}} name="email" rules={[{ max: 50, whitespace: false }]}>
        <Input placeholder="Email" />
      </Item>
      <Item label="Skype" wrapperCol={{span: 24}} labelCol={{span: 24}} name="skype" rules={[{ max: 30, whitespace: false }]}>
        <Input placeholder="Skype" />
      </Item>
      <Item label="Telegram" wrapperCol={{span: 24}} labelCol={{span: 24}} name="telegram" rules={[{ max: 30, whitespace: false }]}>
        <Input placeholder="Telegram username" />
      </Item>
      <Item label="LinkedIn" wrapperCol={{span: 24}} labelCol={{span: 24}} name="linkedin" rules={[{ max: 30, whitespace: false }]}>
        <Input placeholder="LinkedIn username" />
      </Item>
      <Item label="Location" wrapperCol={{span: 24}} labelCol={{span: 24}} name="location" rules={[{ max: 100, whitespace: false }]}>
        <Input placeholder="The location in which you want to work" />
      </Item>
      <Item label="Github" wrapperCol={{span: 24}} labelCol={{span: 24}} name="github" rules={[{ max: 30, whitespace: false }]}>
        <Input placeholder="Github username" />
      </Item>
      <Item label="Website" wrapperCol={{span: 24}} labelCol={{span: 24}} name="website" rules={[{ max: 100, whitespace: false }]}>
        <Input placeholder="For example, a link to a portfolio or something like that" />
      </Item>
    </>
  )

  return (
    <FormCV name="contacts" title="Contacts" content={content} submitFunc={handleFunc} data={contactsList} />
  );
}