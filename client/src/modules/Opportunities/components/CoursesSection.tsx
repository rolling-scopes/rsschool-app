import { StarOutlined, TrophyOutlined } from '@ant-design/icons';
import { Col, List, Row, Typography } from 'antd';
import Section from 'modules/Opportunities/components/Section';
import * as React from 'react';
import css from 'styled-jsx/css';
import { StudentStatus } from './StudentStatus';
import { ResumeCourseDto } from 'api';
import { DataTextValue } from './DataTextValue';

const { Text } = Typography;
const { Item } = List;

type Props = {
  courses: ResumeCourseDto[];
};

export function CoursesSection({ courses }: Props) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <Section title="RS School Courses">
      <List
        dataSource={courses}
        size="small"
        style={{ fontSize: '15px' }}
        renderItem={(record: ResumeCourseDto) => {
          const { fullName, certificateId, completed, totalScore, rank, locationName, mentor } = record;

          const title = `${fullName}${locationName ? locationName : ''}`;
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
    </Section>
  );
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
