import * as React from 'react';
import { Row, Col, Typography } from 'antd';
import SectionCV from './SectionCV';
import ContactsList from './ContactsList';
import AvatarCV from './AvatarCV';
import { Contact } from '../../../../common/models/cv';

const { Title, Text } = Typography;

type Props = {
  name: string;
  desiredPosition: string;
  contacts: Contact[];
};

function MainSection(props: Props) {
  const { name, desiredPosition, contacts } = props;

  const sectionContent = (
    <Row>
      <Col span={4} style={{ minWidth: '120px' }}>
        <AvatarCV />
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
