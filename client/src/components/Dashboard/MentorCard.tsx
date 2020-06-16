import * as React from 'react';
import { Typography, List } from 'antd';
import CommonCard from './CommonDashboardCard';
import { TeamOutlined, GithubFilled, EnvironmentFilled } from '@ant-design/icons';
import { MentorBasic } from '../../../../common/models';
import { GithubAvatar } from 'components';

interface MentorContact {
  contactsEmail?: string;
  contactsPhone?: string;
  contactsSkype?: string;
  contactsTelegram?: string;
  contactsNotes?: string;
}

type Contact = { name: string; value: string | undefined };

type Props = {
  mentor: (MentorBasic & MentorContact) | undefined;
};

export function MentorCard(props: Props) {
  const {
    name,
    githubId,
    contactsEmail,
    contactsPhone,
    contactsSkype,
    contactsTelegram,
    contactsNotes,
    cityName,
    countryName,
  } = props.mentor ?? {};

  const contacts = [
    {
      name: 'E-mail',
      value: contactsEmail,
    },
    {
      name: 'Telegram',
      value: contactsTelegram,
    },
    {
      name: 'Phone',
      value: contactsPhone,
    },
    {
      name: 'Skype',
      value: contactsSkype,
    },
    {
      name: 'Notes',
      value: contactsNotes,
    },
  ];

  const filledContacts = contacts.filter(({ value }: Contact) => value);
  const { Title, Paragraph, Text } = Typography;
  return (
    <CommonCard
      title="Mentor"
      icon={<TeamOutlined />}
      content={
        props.mentor ? (
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <GithubAvatar size={48} githubId={githubId!} style={{ margin: '0 auto 10px', display: 'block' }} />
              <Title level={1} style={{ fontSize: 24, textAlign: 'center', margin: 0 }}>
                {name}
              </Title>
              <Paragraph style={{ textAlign: 'center', marginBottom: 10 }}>
                <a
                  target="_blank"
                  href={`https://github.com/${githubId}`}
                  style={{ marginLeft: '-14px', fontSize: 16 }}
                >
                  <GithubFilled /> {githubId}
                </a>
              </Paragraph>
              <Paragraph style={{ textAlign: 'center', margin: 0 }}>
                <span style={{ marginLeft: '-14px' }}>
                  <EnvironmentFilled /> {`${cityName}, ${countryName}`}
                </span>
              </Paragraph>
            </div>
            <div>
              {filledContacts.length ? (
                <List
                  size="small"
                  itemLayout="horizontal"
                  dataSource={filledContacts}
                  renderItem={({ name, value }: Contact) => (
                    <List.Item>
                      {}
                      <Text strong>{name}:</Text> {value}
                    </List.Item>
                  )}
                />
              ) : null}
            </div>
          </div>
        ) : null
      }
    />
  );
}
