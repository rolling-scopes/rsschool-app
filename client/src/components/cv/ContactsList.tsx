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
import { Contact, ContactType } from '../../../../common/models/cv';

const { Item } = List;
const { Text } = Typography;

type AllowedContacts = {
  [key in ContactType]: {
    icon: React.ReactNode,
    transformFunc?: (contact: string) => React.ReactNode
  }
};

const allowedContacts: AllowedContacts = {
  phone: {
    icon: <PhoneOutlined />,
  },
  email: {
    icon: <MailOutlined />,
    transformFunc: contact => <a href={`mailto:${contact}`}>{contact}</a>,
  },
  skype: {
    icon: <SkypeOutlined />,
    transformFunc: contact => <a href={`skype:${contact}?chat`}>{contact}</a>,
  },
  telegram: {
    icon: <PhoneOutlined />,
    transformFunc: contact => <a href={`https://t.me/${contact}`}>{contact}</a>,
  },
  linkedin: {
    icon: <LinkedinOutlined />,
    transformFunc: contact => <a href={`https://www.linkedin.com/in/${contact}`}>{contact}</a>,
  },
  location: {
    icon: <AimOutlined />,
  },
  github: {
    icon: <GithubOutlined />,
    transformFunc: contact => <a href={`https://github.com/${contact}`}>{contact}</a>,
  },
  website: {
    icon: <IdcardOutlined />,
    transformFunc: contact => <a href={contact}>{contact}</a>,
  },
};

type Props = {
  contacts: Contact[];
};

function ContactsList(props: Props) {
  const { contacts } = props;

  const contactsFiltered = contacts!.filter((item: Contact) => Object.keys(allowedContacts).includes(item.contactType));

  return (
    <List
      dataSource={contactsFiltered}
      renderItem={(contact: Contact) => {
        const { contactType, contactText, transformable } = contact;
        const icon = allowedContacts[contactType].icon;
        let contactTextElem;
        if (transformable) {
          const transformFunc = allowedContacts[contactType].transformFunc!;
          contactTextElem = transformFunc(contactText);
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
}

export default ContactsList;
