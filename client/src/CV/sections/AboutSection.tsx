import * as React from 'react';
import { Row, Col, Typography } from 'antd';
import SectionCV from '../SectionCV';
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
        <Text style={{ fontSize: '16px' }}>{notes}</Text>
      </Col>
    </Row>
  );

  return <SectionCV content={sectionContent} title="About me" icon={<ScheduleOutlined />} />;
}

export default AboutSection;
