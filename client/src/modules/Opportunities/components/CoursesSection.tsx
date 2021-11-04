import { StarOutlined, TrophyOutlined } from '@ant-design/icons';
import { Col, List, Row, Typography } from 'antd';
import { CVStudentStats } from '../models';
import Section from 'modules/Opportunities/components/Section';
import * as React from 'react';
import css from 'styled-jsx/css';
import { StudentStatus } from './StudentStatus';

const { Text } = Typography;
const { Item } = List;

type Props = {
  courses: CVStudentStats[];
};

export function CoursesSection({ courses }: Props) {
  if (courses.length === 0) {
    return null;
  }

  const sectionContent = (
    <List
      dataSource={courses}
      size="small"
      style={{ fontSize: '15px' }}
      renderItem={(record: CVStudentStats) => {
        const {
          courseFullName,
          locationName,
          certificateId,
          isCourseCompleted,
          totalScore,
          rank,
          mentor: { name: mentorName, githubId: mentorGithubId },
        } = record;
        const title = `${courseFullName}${locationName ? locationName : ''}`;
        return (
          <Item>
            <Col flex="1">
              <Text strong>{title}</Text>
              <Row justify="space-between" style={{ marginTop: 8, width: '100%' }}>
                <Col flex={1}>
                  <Row>
                    <span className="course-data-key">Status:</span>
                    <StudentStatus certificateId={certificateId} isCourseCompleted={isCourseCompleted} />
                  </Row>
                  <Row>
                    <span className="course-data-key">Mentor:</span>
                    {mentorName ? (
                      <a className="black-on-print" href={`https://github.com/${mentorGithubId}`}>
                        {mentorName}
                      </a>
                    ) : (
                      <Text>No mentor</Text>
                    )}
                  </Row>
                </Col>
                <Col style={{ minWidth: 130, maxWidth: 130 }}>
                  <Row>
                    <span className="course-data-key">
                      <TrophyOutlined /> Position:
                    </span>
                    {rank}
                  </Row>
                  <Row>
                    <span className="course-data-key">
                      <StarOutlined /> Score:
                    </span>
                    {totalScore}
                  </Row>
                </Col>
              </Row>
            </Col>
            <style jsx>{styles}</style>
          </Item>
        );
      }}
    />
  );

  return <Section content={sectionContent} title="RS School Courses" />;
}

const styles = css`
  .course-data-key {
    font-size: 14px;
    padding-right: 8px;
    white-space: nowrap;
    width: 80px;
    display: inline-block;
  }
`;
