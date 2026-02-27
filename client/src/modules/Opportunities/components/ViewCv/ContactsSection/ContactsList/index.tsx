import { useCopyToClipboard } from 'react-use';
import { Typography, Button } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  SkypeOutlined,
  LinkedinOutlined,
  GithubOutlined,
  IdcardOutlined,
  MessageOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { Contacts, ContactType } from 'modules/Opportunities/models';
import { getContactsToRender } from 'modules/Opportunities/data/getContactsToRender';

import { Link } from 'modules/Opportunities/components/Link';
import { useMessage } from 'hooks';
import styles from './index.module.css';

const { Text } = Typography;

type Props = {
  contacts: Contacts;
};

export const ContactsList = ({ contacts }: Props) => {
  const { notification } = useMessage();
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
        <div className={styles.container} key={i} style={{ paddingTop: 3 }}>
          <div className={styles.icon} style={{ paddingRight: 8 }}>
            {icon}
          </div>
          <div className={styles.value}>{node}</div>
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
    </div>
  );
};

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
  githubUsername: {
    icon: <GithubOutlined />,
    render: contact => <Link title="GitHub" url={`https://github.com/${contact}`} text={contact} />,
  },
  website: {
    icon: <IdcardOutlined />,
    render: contact => <Link title="Website" url={contact} text={contact} />,
  },
};

export default ContactsList;
