
import * as React from 'react';
import { Row, Col, Typography, List } from 'antd';
import SectionCV from './SectionCV';
import { SafetyOutlined } from '@ant-design/icons';
import { CourseData } from '../../../../common/models/cv';

const { Text } = Typography;
const { Item } = List;

type Props = {
  coursesData: CourseData[];
};

function CoursesSection(props: Props) {
  const { coursesData } = props;
  const coursesToShow = coursesData.filter(course => !course.isExpelled);

  const sectionContent = (
    <List
      dataSource={coursesToShow}
      renderItem={(record: CourseData) => {
        const { courseFullName, locationName, isExpelled, certificateId, isCourseCompleted, totalScore, position } = record;
        const title = `${courseFullName}${locationName ? locationName : ''}`;
        const certificateLink = certificateId ? `https://app.rs.school/certificate/${certificateId}` : '';
        const courseStats = `Score: ${totalScore} Position: ${position}`;
        let courseStatus;
        if (isExpelled) {
          courseStatus = <Text>Expelled</Text>;
        } else if (certificateId) {
          courseStatus = (
            <>
              <Text>Completed with </Text>
              <a href={certificateLink}>certificate</a>
            </>
          );
        } else if (isCourseCompleted) {
          courseStatus = <Text>Completed</Text>;
        } else {
          courseStatus = <Text>In progress</Text>;
        }

        return (
          <Item style={{ fontSize: '16px' }}>
            <Row justify='space-between' style={{ width: '100%' }}>
              <Col span={12}>
                <Text strong>{title}</Text>
                <br />
                <Text>Course status: </Text>
                {courseStatus}
              </Col>
              <Col span={3} offset={9}>
                <Text>{courseStats}</Text>
              </Col>
            </Row>
          </Item>
        );
      }}
    />
  );

  const icon = <SafetyOutlined />

  return <SectionCV content={sectionContent} title="RSS courses" icon={icon} />;
}

export default CoursesSection;
