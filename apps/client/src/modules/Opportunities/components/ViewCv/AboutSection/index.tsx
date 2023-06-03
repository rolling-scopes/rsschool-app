import { Row, Col, Typography } from 'antd';
import { BaseSection } from '../BaseSection';

const { Text } = Typography;

type Props = {
  notes: React.ReactNode;
};

export const AboutSection = (props: Props) => {
  const { notes } = props;

  if (!notes) {
    return null;
  }

  return (
    <BaseSection title="About">
      <Row>
        <Col>
          <Text style={{ fontSize: 16, whiteSpace: 'pre-line' }}>{notes}</Text>
        </Col>
      </Row>
    </BaseSection>
  );
};
