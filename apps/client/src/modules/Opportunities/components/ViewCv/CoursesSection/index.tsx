import { StarOutlined, TrophyOutlined } from '@ant-design/icons';
import { Col, List, Row, Typography } from 'antd';
import css from 'styled-jsx/css';
import { ResumeCourseDto, ResumeDto } from 'api';
import { BaseSection } from '../BaseSection';
import { StudentStatus } from 'modules/Opportunities/components/StudentStatus';
import { DataTextValue } from 'modules/Opportunities/components/ViewCv/DataTextValue';

const { Text } = Typography;
const { Item } = List;

type Props = {
  courses: ResumeDto['courses'];
  visibleCourses: ResumeDto['visibleCourses'];
};

export const CoursesSection = ({ courses, visibleCourses }: Props) => {
  if (courses.length === 0) {
    return null;
  }

  const coursesToRender =
    visibleCourses.length > 0 ? courses.filter(course => visibleCourses.includes(course.id)) : courses;

  return (
    <BaseSection title="RS School Courses">
      <List
        dataSource={coursesToRender}
        size="small"
        style={{ fontSize: '15px' }}
        renderItem={(record: ResumeCourseDto) => {
          const { fullName, certificateId, completed, totalScore, rank, locationName, mentor } = record;

          const title = `${fullName}${locationName ? ` (${locationName})` : ''}`;
          return (
            <Item>
              <Col flex="1">
                <Text strong>{title}</Text>
                <Row justify="space-between" style={{ marginTop: 8, width: '100%' }}>
                  <Col flex={1}>
                    <Row>
                      <span className="course-data-key">
                        Status: <StudentStatus certificateId={certificateId} isCourseCompleted={completed} />
                      </span>
                    </Row>
                    <Row>
                      <DataTextValue>
                        Mentor:{' '}
                        {mentor?.name ? (
                          <a className="black-on-print" href={`https://github.com/${mentor.githubId}`}>
                            {mentor.name}
                          </a>
                        ) : (
                          <Text>No mentor</Text>
                        )}
                      </DataTextValue>
                    </Row>
                  </Col>
                  <Col style={{ minWidth: 130, maxWidth: 130 }}>
                    <Row>
                      <DataTextValue>
                        <TrophyOutlined /> Position: {rank}
                      </DataTextValue>
                    </Row>
                    <Row>
                      <DataTextValue>
                        <StarOutlined /> Score: {totalScore}
                      </DataTextValue>
                    </Row>
                  </Col>
                </Row>
              </Col>
              <style jsx>{styles}</style>
            </Item>
          );
        }}
      />
    </BaseSection>
  );
};

const styles = css`
  .course-data-key {
    font-size: 14px;
    padding-right: 8px;
    white-space: nowrap;
    width: 80px;
    display: inline-block;
  }
`;
