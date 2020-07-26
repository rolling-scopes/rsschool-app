import * as React from 'react';
import { Typography, Row, Col, Tooltip } from 'antd';
import CommonCard from './CommonDashboardCard';
import { TrophyOutlined } from '@ant-design/icons';
import GaugeChart from 'react-gauge-chart';

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
  const chartStyle = {
    width: 130,
  };
  return (
    <CommonCard
      title="Your stats"
      icon={<TrophyOutlined />}
      content={
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', alignItems: 'center' }}>
          <Row>
            <Col style={{ marginBottom: 7, textAlign: 'center' }}>
              <GaugeChart
                id="gauge-chart"
                percent={percentageTasksCompleted}
                colors={['#EA4228', '#F5CD19', '#5BE12C']}
                arcsLength={[0.2, 0.3, 0.5]}
                hideText={true}
                style={chartStyle}
              />
              <Tooltip title={`Your performance: ${percentageTasksCompleted * 100} %`}>
                <Text strong>Your performance</Text>
              </Tooltip>
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
