import * as React from 'react';
import { Form, Input } from 'antd';
import { Contact } from '../../../../../common/models/cv';

const { Item } = Form;

type Props = {
  contactsList: Contact[]
};

export default function UserDataForm(props: Props) {

  const {contactsList} = props;

  return (
    <Form name='contacts'>
      {contactsList.map(contact => {
        const { contactType, contactText } = contact;
        return (
          <Item initialValue={contactText} label={contactType} name={`contacts-${contactType}`} key={contactType}>
            <Input />
          </Item>
        )
      })}
    </Form>
  );
}
