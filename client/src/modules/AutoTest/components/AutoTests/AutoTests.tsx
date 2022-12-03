import React, { useContext } from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { SessionContext } from 'modules/Course/contexts';
import { TestCard } from '..';
import { Col, Row } from 'antd';

function AutoTests({ course }: CoursePageProps) {
  const { githubId } = useContext(SessionContext);

  return (
    <PageLayout loading={false} title="Auto-tests" background="#F0F2F5" githubId={githubId} courseName={course.name}>
      <Row gutter={[24, 24]}>
        {Array(13)
          .fill({})
          .map(() => (
            <Col sm={24 / 1} md={24 / 2} lg={24 / 3} xl={24 / 3} xxl={24 / 4}>
              <TestCard />
            </Col>
          ))}
      </Row>
    </PageLayout>
  );
}

export default AutoTests;
