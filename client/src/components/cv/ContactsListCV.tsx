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
  location: {
    icon: <AimOutlined />,
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
  let res;
  if (contacts !== null) {
    const contactsFiltered = Object.entries(contacts);
    const renderContacts = contactsFiltered.filter((contact): contact is EntryOf<Contacts> => contact[1] !== null);
    res = (
      <List
        size="small"
        dataSource={renderContacts}
        renderItem={contact => {
          const contactType: ContactType = contact[0];
          const contactText = contact[1];
          const icon = allowedContacts[contactType].icon;
          let contactTextElem;
          const transformFunction = allowedContacts[contactType].transformFunc;
          if (transformFunction) {
            contactTextElem = transformFunction(contactText as string);
          } else {
            contactTextElem = <Text>{contactText}</Text>;
          }
          return (
            <Item>
              {icon}
              {contactTextElem}
            </Item>
          );
        }}
      />
    );
  } else {
    res = null;
  }

  return res;
}

export default ContactsListCV;
