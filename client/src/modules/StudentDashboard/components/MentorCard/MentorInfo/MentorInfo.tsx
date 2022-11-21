import { Col, Descriptions, Row, Space, Typography } from 'antd';
import React from 'react';
import { MentorBasic } from 'common/models';
import { EnvironmentFilled, GithubFilled } from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';

const { Title, Paragraph, Text, Link } = Typography;

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
    <>
      <Row justify="center" align="middle" gutter={8} style={{ marginBottom: 16 }}>
        <Col>
          <GithubAvatar size={48} githubId={githubId!} />
        </Col>
        <Col>
          <Space direction="vertical" size={0}>
            {name && <Text strong>{name}</Text>}
            <Link target="_blank" href={`https://github.com/${githubId}`} style={{ fontSize: 16 }}>
              <GithubFilled /> {githubId}
            </Link>
          </Space>
        </Col>
      </Row>
      <Row justify="center" style={{ marginBottom: 16 }}>
        <Col>
          <span>
            <EnvironmentFilled /> {`${cityName}, ${countryName}`}
          </span>
        </Col>
      </Row>
      {filledContacts.length ? (
        <Row justify="center" style={{ marginBottom: 16 }}>
          <Col>
            <Descriptions layout="horizontal" column={1} size="small">
              {filledContacts.map(({ name, value }, idx) => (
                <Descriptions.Item labelStyle={{ color: '#b2b2b2' }} key={idx} label={name}>
                  {value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Col>
        </Row>
      ) : null}
    </>
  );
}

export default MentorInfo;
