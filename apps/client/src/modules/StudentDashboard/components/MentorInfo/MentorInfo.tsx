import { Col, Row, Space, Typography } from 'antd';
import React from 'react';
import { MentorBasic } from 'common/models';
import GithubFilled from '@ant-design/icons/GithubFilled';
import EnvironmentFilled from '@ant-design/icons/EnvironmentFilled';
import { GithubAvatar } from 'components/GithubAvatar';

const { Text, Link } = Typography;

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
    <div style={{ marginBottom: 16 }}>
      <Row justify="center" align="middle" gutter={12} style={{ marginBottom: 16 }}>
        <Col>
          <GithubAvatar size={48} githubId={githubId!} />
        </Col>
        <Col>
          <Space direction="vertical" size={4}>
            {name && <Text strong>{name}</Text>}
            <Link target="_blank" href={`https://github.com/${githubId}`}>
              <GithubFilled /> {githubId}
            </Link>
          </Space>
        </Col>
      </Row>
      <Row justify="center" gutter={8} style={{ marginBottom: 16 }}>
        <Col>
          <span>
            <EnvironmentFilled /> {`${cityName}, ${countryName}`}
          </span>
        </Col>
      </Row>
      {filledContacts?.length &&
        filledContacts.map(({ name, value }, idx) => (
          <Row key={idx} justify="center" gutter={8} style={{ marginBottom: 8 }}>
            <Col>
              <Text type="secondary">{`${name}:`}</Text>
            </Col>
            <Col>
              <Text>{value}</Text>
            </Col>
          </Row>
        ))}
    </div>
  );
}

export default MentorInfo;
