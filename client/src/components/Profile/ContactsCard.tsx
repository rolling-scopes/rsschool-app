import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { List, Typography, Input } from 'antd';
import CommonCard from './CommonCard';
import { Contacts } from 'common/models/profile';
import { ConfigurableProfilePermissions } from 'common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Text } = Typography;

import { ContactsOutlined } from '@ant-design/icons';

type Props = {
  data: Contacts;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  onProfileSettingsChange: (event: any, path: string) => void;
};

type Contact = { name: string; value: string | null; key: string };

class ContactsCard extends React.Component<Props> {
  state = {
    data: null,
  };

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

  shouldComponentUpdate = (nextProps: Props) => {
    const {
      isEmailVisible,
      isTelegramVisible,
      isPhoneVisible,
      isSkypeVisible,
      isContactsNotesVisible,
      isLinkedInVisible,
    } = this.props.permissionsSettings!;

    return (
      !isEqual(nextProps.data, this.props.data) ||
      !isEqual(nextProps.permissionsSettings?.isEmailVisible, isEmailVisible) ||
      !isEqual(nextProps.permissionsSettings?.isTelegramVisible, isTelegramVisible) ||
      !isEqual(nextProps.permissionsSettings?.isPhoneVisible, isPhoneVisible) ||
      !isEqual(nextProps.permissionsSettings?.isSkypeVisible, isSkypeVisible) ||
      !isEqual(nextProps.permissionsSettings?.isContactsNotesVisible, isContactsNotesVisible) ||
      !isEqual(nextProps.permissionsSettings?.isLinkedInVisible, isLinkedInVisible) ||
      !isEqual(nextProps.isEditingModeEnabled, this.props.isEditingModeEnabled)
    );
  };

  render() {
    const { isEditingModeEnabled, permissionsSettings, onPermissionsSettingsChange, onProfileSettingsChange } =
      this.props;
    const { email, telegram, phone, skype, notes, linkedIn } = this.props.data;
    const contacts = [
      {
        name: 'E-mail',
        value: email,
        key: 'email',
      },
      {
        name: 'Telegram',
        value: telegram,
        key: 'telegram',
      },
      {
        name: 'Phone',
        value: phone,
        key: 'phone',
      },
      {
        name: 'Skype',
        value: skype,
        key: 'skype',
      },
      {
        name: 'Notes',
        value: notes,
        key: 'notes',
      },
      {
        name: 'LinkedIn',
        value: linkedIn,
        key: 'linkedIn',
      },
    ];
    const filledContacts = contacts.filter(({ value }: Contact) => value);

    return (
      <CommonCard
        title="Contacts"
        icon={<ContactsOutlined />}
        content={
          filledContacts.length ? (
            <List
              itemLayout="horizontal"
              dataSource={filledContacts}
              renderItem={({ name, value, key }: Contact) => (
                <List.Item>
                  <Text strong>{name}:</Text>{' '}
                  {key !== 'linkedIn' ? (
                    value
                  ) : (
                    <a target="__blank" href={value!}>
                      {value}
                    </a>
                  )}
                </List.Item>
              )}
            />
          ) : undefined
        }
        noDataDescrption="Contacts aren't filled in"
        permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
        isEditingModeEnabled={isEditingModeEnabled}
        onPermissionsSettingsChange={onPermissionsSettingsChange}
        profileSettingsContent={
          <List
            itemLayout="horizontal"
            dataSource={contacts}
            renderItem={({ name, value, key }: Contact) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <p style={{ fontSize: 18, marginBottom: 5 }}>
                    <Text strong>{name}:</Text>
                  </p>
                  <Input
                    value={value || ''}
                    style={{ width: '100%' }}
                    onChange={(event: any) => onProfileSettingsChange(event, `contacts.${key}`)}
                  />
                </div>
              </List.Item>
            )}
          />
        }
      />
    );
  }
}

export default ContactsCard;
