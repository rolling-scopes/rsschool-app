import * as React from 'react';
import { Row, Col, Typography, List } from 'antd';
import SectionCV from './SectionCV';
import { ReadOutlined } from '@ant-design/icons';
import { EducationRecord } from '../../../../common/models/cv';

const { Text } = Typography;
const { Item } = List;

type Props = {
  educationHistory: EducationRecord[];
};

function EducationSection(props: Props) {
  const { educationHistory } = props;

  const sectionContent = (
      <List
      dataSource={educationHistory}
      renderItem={(record: EducationRecord) => {
        const { startYear, finishYear, education, organization } = record;

        const areYearsDifferent = startYear !== finishYear;

        return (
          <Item style={{fontSize: '16px'}}>
            <Row justify='space-between' style={{width: '100%'}}>
              <Col span={12}>
                <Text strong>{organization}</Text>
                <br />
                <Text>{education}</Text>
              </Col>
              <Col span={3} offset={9}>
                <Text>{startYear}</Text>
                {areYearsDifferent && (
                <>
                  <br />
                  <Text>{finishYear}</Text>
                </>
                )}
              </Col>
            </Row>
          </Item>
        );
      }}
    />
  );

  const icon = <ReadOutlined />

  return <SectionCV content={sectionContent} title="Education history" icon={icon} />;
}

export default EducationSection;
