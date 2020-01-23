import * as React from 'react';
import {
  List,
  Typography,
} from 'antd';
import CommonCard from './CommonCard';
import { Contacts } from '../../../../common/models/profile';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';

const { Text } = Typography;

import { ContactsOutlined } from '@ant-design/icons';

type Props = {
  data: Contacts;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
};

type Contact = { name: string, value?: string };

class ContactsCard extends React.Component<Props> {
  private filterPermissions = ({
    isEmailVisible,
    isTelegramVisible,
    isPhoneVisible,
    isSkypeVisible,
    isContactsNotesVisible,
    isLinkedInVisible,
  }: Partial<ConfigurableProfilePermissions>) => ({
    isEmailVisible,
    isTelegramVisible,
    isPhoneVisible,
    isSkypeVisible,
    isContactsNotesVisible,
    isLinkedInVisible,
  });

  render() {
    const { isEditingModeEnabled, permissionsSettings } = this.props;
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
        permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
        isEditingModeEnabled={isEditingModeEnabled}
      />
    );
  }
}

export default ContactsCard;
