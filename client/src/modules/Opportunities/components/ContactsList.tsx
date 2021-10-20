import * as React from 'react';
import { Typography, Button, notification } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  SkypeOutlined,
  LinkedinOutlined,
  AimOutlined,
  GithubOutlined,
  IdcardOutlined,
  MessageOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { Contacts, ContactType } from 'common/models/cv';
import { getContactsToRender } from '../data/getContactsToRender';
import { useCopyToClipboard } from 'react-use';

const { Text } = Typography;

type Props = {
  contacts: Contacts;
};

function ContactsList({ contacts }: Props) {
  const contactsToRender = getContactsToRender(contacts);
  const [, copyToClipboard] = useCopyToClipboard();

  const list = contactsToRender.map(([type, text]) => {
    const { icon, render } = contactRendererMap[type];
    const node = render?.(text as string) ?? <Text>{text}</Text>;
    return { icon, node, value: text };
  });

  return (
    <div>
      {list.map(({ icon, node, value }, i) => (
        <div key={i} style={{ paddingTop: 3 }}>
          <span className="cv-icon-inverted" style={{ paddingRight: 8 }}>
            {icon}
          </span>
          <span>
            {node}
            <Button
              onClick={() => {
                copyToClipboard(value ?? '');
                notification.success({ message: 'Copied to clipboard' });
              }}
              style={{ color: '#fff' }}
              size="small"
              type="text"
              icon={<CopyOutlined />}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

type AllowedContacts = {
  [key in ContactType]: {
    icon: React.ReactNode;
    render?: (contact: string) => React.ReactNode;
  };
};

const contactRendererMap: AllowedContacts = {
  phone: {
    icon: <PhoneOutlined />,
    render: contact => (
      <a className="rs-link" title="Phone" target="_blank" rel="nofollow" href={`tel:${contact}`}>
        {contact}
      </a>
    ),
  },
  email: {
    icon: <MailOutlined />,
    render: contact => (
      <a title="E-mail" className="rs-link" target="_blank" rel="nofollow" href={`mailto:${contact}`}>
        {contact}
      </a>
    ),
  },
  skype: {
    icon: <SkypeOutlined />,
    render: contact => (
      <a title="Skype" className="rs-link" target="_blank" rel="nofollow" href={`skype:${contact}?chat`}>
        {contact}
      </a>
    ),
  },
  telegram: {
    icon: <MessageOutlined />,
    render: contact => (
      <a title="Telegram" className="rs-link" target="_blank" rel="nofollow" href={`https://t.me/${contact}`}>
        @{contact}
      </a>
    ),
  },
  linkedin: {
    icon: <LinkedinOutlined />,
    render: contact => (
      <a className="rs-link" title="LinkedIn" target="_blank" rel="nofollow" href={contact}>
        {contact}
      </a>
    ),
  },
  locations: {
    icon: <AimOutlined />,
    render: locations => locations.split('\n').join('; '),
  },
  github: {
    icon: <GithubOutlined />,
    render: contact => (
      <a className="rs-link" title="Github" target="_blank" rel="nofollow" href={`https://github.com/${contact}`}>
        {contact}
      </a>
    ),
  },
  website: {
    icon: <IdcardOutlined />,
    render: contact => (
      <a className="rs-link" title="Website" target="_blank" rel="nofollow" href={contact}>
        {contact}
      </a>
    ),
  },
};

export default ContactsList;
