import * as React from 'react';
import { List, Typography } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  SkypeOutlined,
  LinkedinOutlined,
  AimOutlined,
  GithubOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { Contacts, ContactType } from '../../../../common/models/cv';

const { Item } = List;
const { Text } = Typography;

type AllowedContacts = {
  [key in ContactType]: {
    icon: React.ReactNode;
    transformFunc?: (contact: string) => React.ReactNode;
  };
};

const allowedContacts: AllowedContacts = {
  phone: {
    icon: <PhoneOutlined />,
  },
  email: {
    icon: <MailOutlined />,
    transformFunc: contact => (
      <a className="black-on-print" href={`mailto:${contact}`}>
        {contact}
      </a>
    ),
  },
  skype: {
    icon: <SkypeOutlined />,
    transformFunc: contact => (
      <a className="black-on-print" href={`skype:${contact}?chat`}>
        {contact}
      </a>
    ),
  },
  telegram: {
    icon: <PhoneOutlined />,
    transformFunc: contact => (
      <a className="black-on-print" href={`https://t.me/${contact}`}>
        {contact}
      </a>
    ),
  },
  linkedin: {
    icon: <LinkedinOutlined />,
    transformFunc: contact => (
      <a className="black-on-print" href={`https://www.linkedin.com/in/${contact}`}>
        {contact}
      </a>
    ),
  },
  locations: {
    icon: <AimOutlined />,
    transformFunc: locations => (
      <ol>
        {locations.split('\n').map(location => (
          <li key={location}>{location}</li>
        ))}
      </ol>
    ),
  },
  github: {
    icon: <GithubOutlined />,
    transformFunc: contact => (
      <a className="black-on-print" href={`https://github.com/${contact}`}>
        {contact}
      </a>
    ),
  },
  website: {
    icon: <IdcardOutlined />,
    transformFunc: contact => (
      <a className="black-on-print" href={contact}>
        {contact}
      </a>
    ),
  },
};

type Props = {
  contacts: Contacts | null;
};

type EntryOf<T extends object> = { [K in keyof T]: [K, T[K]] }[keyof T];

function ContactsListCV(props: Props) {
  const { contacts } = props;

  if (!contacts) return null;

  const contactsEntries = Object.entries(contacts);
  const contactsToRender = contactsEntries.filter((contact): contact is EntryOf<Contacts> => contact[1] !== null);

  return (
    <List
      size="small"
      dataSource={contactsToRender}
      renderItem={contact => {
        const [contactType, contactText] = contact;
        const icon = allowedContacts[contactType].icon;

        const transformFunction = allowedContacts[contactType].transformFunc;
        const contactTextElem = transformFunction ? (
          transformFunction(contactText as string)
        ) : (
          <Text>{contactText}</Text>
        );
        return (
          <Item>
            {icon}
            {contactTextElem}
          </Item>
        );
      }}
    />
  );
}

export default ContactsListCV;
