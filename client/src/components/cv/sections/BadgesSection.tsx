import * as React from 'react';
import { Row, Col, Typography } from 'antd';
import SectionCV from '../SectionCV';
import { SafetyOutlined } from '@ant-design/icons';
import { BadgesData } from '../../../../../common/models/cv';

const { Text } = Typography;

type Props = {
  badgesData: BadgesData;
};

function BadgesSection(props: Props) {
  const { badgesData: {badges, total} } = props;

  const badgeStyle = {
    padding: '2px',
    border: '1px solid black',
    backgroundColor: 'green',
    borderRadius: '15px',
    margin: '0 5px'
  };

  const badgesElements = badges.map(badge => <Text style={badgeStyle} key={badge}>{badge}</Text>)

  const sectionContent = (
    <>
    <Row style={{fontSize: '16px'}}>
      <Col>
          <Text>Total bagdes count: {total}</Text>
      </Col>
    </Row>
    <Row style={{fontSize: '16px'}}>
      <Col span={24}>{badgesElements}</Col>
    </Row>
    </>
  );

  const icon = <SafetyOutlined />

  return <SectionCV content={sectionContent} title="Badges" icon={icon} />;
}

export default BadgesSection;
