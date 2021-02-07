import * as React from 'react';
import { Row, Col, Typography } from 'antd';
import SectionCV from '../SectionCV';
import ContactsListCV from '../ContactsListCV';
import AvatarCV from '../AvatarCV';
import { Contacts, MilitaryService, EnglishLevel } from '../../../../../common/models/cv';
import { SmileOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

type Props = {
  avatarLink: string | null;
  name: string | null;
  desiredPosition: string | null;
  contacts: Contacts;
  englishLevel: EnglishLevel;
  militaryService: MilitaryService;
  selfIntroLink: string | null;
  startFrom: string | null;
  fullTime: boolean;
};

function MainSection(props: Props) {
  const { avatarLink, name, desiredPosition, contacts, englishLevel, militaryService, selfIntroLink, startFrom, fullTime } = props;

  const sectionContent = (
    <Row>
      <Col flex={4} style={{ minWidth: '120px' }}>
        <AvatarCV src={avatarLink} />
        <br />
        <br />
        <Text>English level: <Text strong>{englishLevel}</Text></Text>
        <br />
        {militaryService && <Text>Military service: <Text strong>{militaryService}</Text> </Text>}
        <br />
        {selfIntroLink && (
          <>
          <a className='hide-on-print' href={selfIntroLink}>Self introduction video</a>
          <br className='hide-on-print' />
          </>
        )}
        <Text>Ready to work full time: <Text strong>{fullTime ? 'yes' : 'no'}</Text></Text>
        <br />
        {startFrom && <time dateTime={startFrom}>Ready to work from <Text strong>{startFrom}</Text></time>}
      </Col>
      <Col flex={14}>
        <Title level={2}>{name}</Title>
        <Text>{desiredPosition}</Text>
      </Col>
      <Col flex={6}>
        <ContactsListCV contacts={contacts} />
      </Col>
    </Row>
  );
  return <SectionCV title='General info' icon={<SmileOutlined />} content={sectionContent} />;
}

export default MainSection;
