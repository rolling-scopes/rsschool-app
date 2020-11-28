import * as React from 'react';
import { Form, Input, Button } from 'antd';
import { Contact } from '../../../../../common/models/cv';

const { Item } = Form;

type Props = {
  contactsList: Contact[];
  handleFunc: (data: any) => void;
};

export default function UserDataForm(props: Props) {

  const { contactsList, handleFunc } = props;

  return (
    <Form name='contacts' onFinish={handleFunc}>
      {contactsList.map(contact => {
        const { contactType, contactText } = contact;
        return (
          <Item initialValue={contactText} label={contactType} name={`contacts-${contactType}`} key={contactType}>
            <Input />
          </Item>
        )
      })}
      <Item>
        <Button type='primary' htmlType='submit'>Save</Button>
      </Item>
    </Form>
  );
}
