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
import { Contacts, ContactType } from '../models';
import { getContactsToRender } from '../data/getContactsToRender';
import { useCopyToClipboard } from 'react-use';
import { Link } from './Link';

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
        <div className="container" key={i} style={{ paddingTop: 3 }}>
          <div className="icon" style={{ paddingRight: 8 }}>
            {icon}
          </div>
          <div className="value">{node}</div>
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
        </div>
      ))}
      <style jsx>{`
        .container {
          max-width: 100%;
          display: flex;
        }

        .value {
          word-break: break-all;
        }

        @media print {
          .icon {
            color: #000 !important;
          }
          .icon .anticon svg {
            fill: #000 !important;
          }
        }
      `}</style>
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
    render: contact => <Link title="Phone" url={`tel:${contact}`} text={contact} />,
  },
  email: {
    icon: <MailOutlined />,
    render: contact => <Link title="E-mail" url={`mailto:${contact}`} text={contact} />,
  },
  skype: {
    icon: <SkypeOutlined />,
    render: contact => <Link title="Skype" url={`skype:${contact}?chat`} text={contact} />,
  },
  telegram: {
    icon: <MessageOutlined />,
    render: contact => <Link title="Telegram" url={`https://t.me/${contact}`} text={`@${contact}`} />,
  },
  linkedin: {
    icon: <LinkedinOutlined />,
    render: contact => <Link title="LinkedIn" url={contact} text={contact} />,
  },
  locations: {
    icon: <AimOutlined />,
    render: locations => locations.split('\n').join('; '),
  },
  github: {
    icon: <GithubOutlined />,
    render: contact => <Link title="Github" url={`https://github.com/${contact}`} text={contact} />,
  },
  website: {
    icon: <IdcardOutlined />,
    render: contact => <Link title="Website" url={contact} text={contact} />,
  },
};

export default ContactsList;
