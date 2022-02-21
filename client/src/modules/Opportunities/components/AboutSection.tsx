import * as React from 'react';
import { Row, Col, Typography } from 'antd';
import Section from './Section';

const { Text } = Typography;

type Props = {
  notes: React.ReactNode;
};

function AboutSection(props: Props) {
  const { notes } = props;

  if (!notes) {
    return null;
  }

  const sectionContent = (
    <Row>
      <Col>
        <Text style={{ fontSize: 16, whiteSpace: 'pre-line' }}>{notes}</Text>
      </Col>
    </Row>
  );

  return <Section content={sectionContent} title="About" />;
}

export default AboutSection;
