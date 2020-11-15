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
import { Contact } from '../../../../common/models/cv';

const { Item } = List;
const { Text } = Typography;

const allowedContacts: any = {
  phone: {
    icon: <PhoneOutlined />,
  },
  email: {
    icon: <MailOutlined />,
    transformFunc: (contact: string): React.ReactNode => <a href={`mailto:${contact}`}>{contact}</a>,
  },
  skype: {
    icon: <SkypeOutlined />,
    transformFunc: (contact: string): React.ReactNode => <a href={`skype:${contact}?chat`}>{contact}</a>,
  },
  telegram: {
    icon: <PhoneOutlined />,
    transformFunc: (contact: string): React.ReactNode => <a href={`https://t.me/${contact}`}>{contact}</a>,
  },
  linkedin: {
    icon: <LinkedinOutlined />,
    transformFunc: (contact: string): React.ReactNode => (
      <a href={`https://www.linkedin.com/in/${contact}`}>{contact}</a>
    ),
  },
  location: {
    icon: <AimOutlined />,
  },
  github: {
    icon: <GithubOutlined />,
    transformFunc: (contact: string): React.ReactNode => <a href={`https://github.com/${contact}`}>{contact}</a>,
  },
  website: {
    icon: <IdcardOutlined />,
    transformFunc: (contact: string): React.ReactNode => <a href={contact}>{contact}</a>,
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
        return (
          <Item>
            {icon}
            {transformable ? allowedContacts[contactType].transformFunc(contactText) : <Text>{contactText}</Text>}
          </Item>
        );
      }}
    />
  );
}

export default ContactsList;
