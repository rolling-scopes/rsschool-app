import * as React from 'react';
import { Row, Col, Typography, List } from 'antd';
import SectionCV from '../SectionCV';
import { SafetyOutlined } from '@ant-design/icons';
import { CourseData } from '../../../../../common/models/cv';

const { Text } = Typography;
const { Item } = List;

function StudentStatus(props: { isExpelled: boolean; certificateId: string | null; isCourseCompleted: boolean }) {
  const { isExpelled, certificateId, isCourseCompleted } = props;
  if (isExpelled) return <Text>Expelled</Text>;
  const certificateLink = certificateId ? `https://app.rs.school/certificate/${certificateId}` : '';

  if (certificateId)
    return (
      <>
        <Text>Completed with </Text>
        <a href={certificateLink}>certificate</a>
      </>
    );
  if (isCourseCompleted) return <Text>Completed</Text>;
  return <Text>In progress</Text>;
}

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
        const {
          courseFullName,
          locationName,
          isExpelled,
          certificateId,
          isCourseCompleted,
          totalScore,
          position,
          mentor: { name: mentorName, githubId: mentorGithubId },
        } = record;
        const title = `${courseFullName}${locationName ? locationName : ''}`;
        const courseStats = `Score: ${totalScore}
        Position: ${position}`;
        return (
          <Item style={{ fontSize: '16px' }}>
            <Row justify="space-between" style={{ width: '100%' }}>
              <Col span={12}>
                <Text strong>{title}</Text>
                <br />
                <Text>Course status: </Text>
                <StudentStatus
                  isExpelled={isExpelled}
                  certificateId={certificateId}
                  isCourseCompleted={isCourseCompleted}
                />
              </Col>
              <Col span={3}>
                <Text>
                  Mentor:{' '}
                  <a className="black-on-print" href={`https://github.com/${mentorGithubId}`}>
                    {mentorName}
                  </a>
                </Text>
              </Col>
              <Col span={3}>
                <Text>{courseStats}</Text>
              </Col>
            </Row>
          </Item>
        );
      }}
    />
  );

  return <SectionCV content={sectionContent} title="RSS courses" icon={<SafetyOutlined />} />;
}

export default CoursesSection;
