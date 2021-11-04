import * as React from 'react';
import { TrophyOutlined } from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import dynamic from 'next/dynamic';
import CommonCard from './CommonDashboardCard';

const PerformanceChart = dynamic(() => import('./PerformanceChart'), { ssr: false });

type Props = {
  isActive: boolean;
  totalScore: number;
  position: number;
  maxCourseScore: number;
};

export function MainStatsCard(props: Props) {
  const { isActive, totalScore, position, maxCourseScore } = props;
  const { Text } = Typography;
  const percentageTasksCompleted = maxCourseScore ? Number((totalScore / maxCourseScore).toFixed(2)) : 0;
  return (
    <CommonCard
      title="Your stats"
      icon={<TrophyOutlined />}
      content={
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', alignItems: 'center' }}>
          <Row>
            <Col style={{ marginBottom: 7, textAlign: 'center' }}>
              <PerformanceChart percent={percentageTasksCompleted} text="Your performance" />
            </Col>
          </Row>
          <Row>
            <Col>
              <p style={{ marginBottom: 7 }}>
                Status:{' '}
                <Text style={{ color: isActive ? '#87d068' : '#ff5500' }} strong>
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
              </p>
              {
                <p style={{ marginBottom: 7 }}>
                  Position: <Text strong>{position}</Text>
                </p>
              }
              <p style={{ marginBottom: 7 }}>
                Total Score: <Text mark>{totalScore}</Text>
                {maxCourseScore && ` / ${maxCourseScore}`}
              </p>
            </Col>
          </Row>
        </div>
      }
    />
  );
}
