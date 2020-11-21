import * as React from 'react';
import { Row, Col, Typography } from 'antd';
import SectionCV from '../SectionCV';
import ContactsList from '../ContactsList';
import AvatarCV from '../AvatarCV';
import { Contact, MilitaryService, SelfIntroLink, EnglishLevel } from '../../../../../common/models/cv';

const { Title, Text } = Typography;

type Props = {
  name: string;
  desiredPosition: string;
  contacts: Contact[];
  englishLevel: EnglishLevel,
  militaryService: MilitaryService,
  selfIntroLink: SelfIntroLink
};

function MainSection(props: Props) {
  const { name, desiredPosition, contacts, englishLevel, militaryService, selfIntroLink } = props;

  const sectionContent = (
    <Row>
      <Col span={4} style={{ minWidth: '120px' }}>
        <AvatarCV />
        <br />
        <br />
        <Text>English level: {englishLevel}</Text>
        <br />
        {militaryService && <Text>Military service: {militaryService}</Text>}
        <br />
        {selfIntroLink && <a href={selfIntroLink}>Self introduction video</a>}
      </Col>
      <Col span={14}>
        <Title level={2}>{name}</Title>
        <Text>{desiredPosition}</Text>
      </Col>
      <Col span={6}>
        <ContactsList contacts={contacts} />
      </Col>
    </Row>
  );
  return <SectionCV content={sectionContent} />;
}

export default MainSection;
