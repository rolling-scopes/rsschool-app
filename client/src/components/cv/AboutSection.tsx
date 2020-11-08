import * as React from 'react';
import { Row, Col, Typography } from 'antd';
import SectionCV from './SectionCV';
import { ScheduleOutlined } from '@ant-design/icons';

const { Text } = Typography;

type Props = {
  notes: React.ReactNode;
};

function AboutSection(props: Props) {
  const { notes } = props;

  const sectionContent = (
    <Row>
      <Col>
        <Text>{notes}</Text>
      </Col>
    </Row>
  );

  const icon = <ScheduleOutlined />

  return <SectionCV content={sectionContent} title="About me" icon={icon} />;
}

export default AboutSection;
