import { Col, Descriptions, Typography } from 'antd';
import React from 'react';
import { MentorBasic } from 'common/models';
import { EnvironmentFilled, GithubFilled } from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';

const { Title, Paragraph } = Typography;

export interface MentorContact {
  contactsEmail?: string;
  contactsPhone?: string;
  contactsSkype?: string;
  contactsTelegram?: string;
  contactsNotes?: string;
}

type Contact = { name: string; value: string | undefined };

interface Props {
  mentor: MentorBasic & MentorContact;
}

function MentorInfo({ mentor }: Props) {
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
  } = mentor;

  const contacts = [
    { name: 'E-mail', value: contactsEmail },
    { name: 'Telegram', value: contactsTelegram },
    { name: 'Phone', value: contactsPhone },
    { name: 'Skype', value: contactsSkype },
    { name: 'Notes', value: contactsNotes },
  ];

  const filledContacts = contacts.filter(({ value }: Contact) => value);

  return (
    <Col>
      <div style={{ marginBottom: 8 }}>
        <GithubAvatar size={48} githubId={githubId!} style={{ margin: '0 auto 10px', display: 'block' }} />
        <Title level={1} style={{ fontSize: 24, textAlign: 'center', margin: 0 }}>
          {name}
        </Title>
        <Paragraph style={{ textAlign: 'center', marginBottom: 10 }}>
          <a target="_blank" href={`https://github.com/${githubId}`} style={{ fontSize: 16 }}>
            <GithubFilled /> {githubId}
          </a>
        </Paragraph>
        <Paragraph style={{ textAlign: 'center', margin: 0 }}>
          <span>
            <EnvironmentFilled /> {`${cityName}, ${countryName}`}
          </span>
        </Paragraph>
      </div>
      <div style={{ marginBottom: 4 }}>
        {filledContacts.length ? (
          <Descriptions layout="horizontal" column={1} size="small">
            {filledContacts.map(({ name, value }, idx) => (
              <Descriptions.Item labelStyle={{ color: '#666' }} key={idx} label={name}>
                {value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : null}
      </div>
    </Col>
  );
}

export default MentorInfo;
