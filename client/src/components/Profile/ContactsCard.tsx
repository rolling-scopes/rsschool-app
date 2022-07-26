import React, { useEffect, useMemo, useState } from 'react';
import { List, Typography } from 'antd';
import { ContactsOutlined } from '@ant-design/icons';
import { isEqual } from 'lodash';
import { ProfileApi, UpdateProfileInfoDto } from 'api';
import { Contacts } from 'common/models/profile';
import { NotificationChannel } from 'modules/Notifications/services/notifications';
import { EmailConfirmation } from './EmailConfirmation';
import CommonCardWithSettingsModal from './CommonCardWithSettingsModal';
import { onSaveError, onSaveSuccess } from 'utils/profileMessengers';
import { Contact, ContactsKeys } from 'services/user';
import ContactsCardForm from './ContactsCardForm';

const { Text } = Typography;

type Connections = Partial<
  Record<
    NotificationChannel,
    | {
        value: string;
        enabled: boolean;
        lastLinkSentAt?: string;
      }
    | undefined
  >
>;

type Props = {
  data: Contacts;
  isEditingModeEnabled: boolean;
  connections: Connections;
  sendConfirmationEmail: () => void;
};
const profileApi = new ProfileApi();

const ContactsCard = ({ connections, data, isEditingModeEnabled, sendConfirmationEmail }: Props) => {
  const [displayValues, setDisplayValues] = useState(data);
  const [values, setValues] = useState(displayValues);
  const [hasError, setHasError] = useState(false);
  const { email, epamEmail, telegram, phone, skype, notes, linkedIn } = displayValues;
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const contacts: Contact[] = useMemo(
    () => [
      {
        name: 'EPAM E-mail',
        value: epamEmail,
        key: ContactsKeys.epamEmail,
        rules: [{ type: 'email', message: 'Email is not valid' }],
      },
      {
        name: 'E-mail',
        value: email,
        key: ContactsKeys.email,
        rules: [{ type: 'email', message: 'Email is not valid' }],
      },
      {
        name: 'Telegram',
        value: telegram,
        key: ContactsKeys.telegram,
      },
      {
        name: 'Phone',
        value: phone,
        key: ContactsKeys.phone,
      },
      {
        name: 'Skype',
        value: skype,
        key: ContactsKeys.skype,
      },
      {
        name: 'Notes',
        value: notes,
        key: ContactsKeys.notes,
      },
      {
        name: 'LinkedIn',
        value: linkedIn,
        key: ContactsKeys.linkedIn,
      },
    ],
    [displayValues],
  );

  const filledContacts = contacts.filter(({ value }: Contact) => value);

  const handleSave = async () => {
    try {
      const { email, epamEmail, telegram, phone, skype, notes, linkedIn } = values;
      const updatedContacts: UpdateProfileInfoDto = {
        contactsEpamEmail: epamEmail,
        contactsEmail: email,
        contactsTelegram: telegram,
        contactsPhone: phone,
        contactsSkype: skype,
        contactsNotes: notes,
        contactsLinkedIn: linkedIn,
      };
      await profileApi.updateProfileInfoFlat(updatedContacts);
      setDisplayValues(values);
      onSaveSuccess();
    } catch (error) {
      onSaveError();
    }
  };

  const handleCancel = () => {
    setValues(displayValues);
    setHasError(false);
  };

  const content = filledContacts.length ? (
    <List
      itemLayout="horizontal"
      dataSource={filledContacts}
      renderItem={({ name, value, key }: Contact) => (
        <List.Item>
          <Text strong>{name}:</Text>{' '}
          {key !== ContactsKeys.linkedIn ? (
            <>
              {value}
              {key === ContactsKeys.email &&
              (!connections.email || !connections.email.enabled) &&
              isEditingModeEnabled ? (
                <EmailConfirmation connection={connections.email} sendConfirmationEmail={sendConfirmationEmail} />
              ) : null}
            </>
          ) : value ? (
            <a target="__blank" href={value}>
              {value}
            </a>
          ) : null}
        </List.Item>
      )}
    />
  ) : null;

  useEffect(() => {
    const readyToUpdate = !isEqual(displayValues, values) && !hasError;
    setIsSaveDisabled(!readyToUpdate);
  }, [hasError, values, displayValues]);

  return (
    <CommonCardWithSettingsModal
      title="Contacts"
      icon={<ContactsOutlined />}
      content={content}
      noDataDescription="Contacts aren't filled in"
      isEditingModeEnabled={isEditingModeEnabled}
      saveProfile={handleSave}
      cancelChanges={handleCancel}
      isSaveDisabled={isSaveDisabled}
      profileSettingsContent={<ContactsCardForm contacts={contacts} setValues={setValues} setHasError={setHasError} />}
    />
  );
};

export default ContactsCard;
