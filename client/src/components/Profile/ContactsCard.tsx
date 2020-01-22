import * as React from 'react';
import { Contacts } from '../../../../common/models/profile';
import {
  List,
  Typography,
} from 'antd';
import CommonCard from './CommonCard';

const { Text } = Typography;

import { ContactsOutlined } from '@ant-design/icons';

type Props = {
  data: Contacts;
  isEditingModeEnabled: boolean;
};

type Contact = { name: string, value?: string };

class ContactsCard extends React.Component<Props> {
  render() {
    const { email, telegram, phone, skype, notes } = this.props.data;
    const contacts = [{
      name: 'E-mail',
      value: email,
    }, {
      name: 'Telegram',
      value: telegram ? `@${telegram}` : telegram,
    }, {
      name: 'Phone',
      value: phone,
    }, {
      name: 'Skype',
      value: skype,
    }, {
      name: 'Notes',
      value: notes,
    }].filter(({ value }: Contact) => value);

    return (
      <CommonCard
        title="Contacts"
        icon={<ContactsOutlined />}
        content={
          <List
            itemLayout="horizontal"
            dataSource={contacts}
            renderItem={({ name, value }: Contact) => (
              <List.Item>
                <Text strong>{name}:</Text> {value}
              </List.Item>
            )}
          />
        }
      />
    );
  }
}

export default ContactsCard;
