import * as React from 'react';
import { TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import dynamic from 'next/dynamic';

const PerformanceChart = dynamic(() => import('./PerformanceChart'), { ssr: false });

const { Title, Text } = Typography;

type Props = {
  isActive: boolean;
  totalScore: number;
  position: number;
  maxCourseScore: number;
  totalStudentsCount: number;
};

interface IStyle {
  [key: string]: React.CSSProperties;
}

export function MainStatsCard({ totalScore, position, maxCourseScore, totalStudentsCount }: Props) {
  const percentageTasksCompleted = maxCourseScore ? Number((totalScore / maxCourseScore).toFixed(2)) : 0;
  const positionText = `${position}${totalStudentsCount ? ` / ${totalStudentsCount}` : ''}`;
  const totalScoreText = `${totalScore}${maxCourseScore ? ` / ${maxCourseScore}` : ''}`;
  const { gridStyle, contentColStyle, contentDivStyle, contentPStyle, iconStyle, textStyle } = STYLE;

  return (
    <Card
      title={
        <Title level={2} ellipsis={true} style={{ fontSize: 16, marginBottom: 0 }}>
          Your stats
        </Title>
      }
      bodyStyle={{ padding: 0 }}
    >
      <Card.Grid hoverable={false} style={{ ...gridStyle, paddingTop: 0 }}>
        <PerformanceChart percent={percentageTasksCompleted} />
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyle}>
        <div style={contentColStyle}>
          <div style={contentDivStyle}>
            <p style={contentPStyle}>
              <TrophyOutlined style={iconStyle} />
              Position
            </p>
            <Text style={textStyle}>{positionText}</Text>
          </div>
          <div style={contentDivStyle}>
            <p style={contentPStyle}>
              <FireOutlined style={iconStyle} />
              Total Score
            </p>
            <Text style={textStyle}>{totalScoreText}</Text>
          </div>
        </div>
      </Card.Grid>
    </Card>
  );
}

const STYLE: IStyle = {
  contentDivStyle: {
    minWidth: 106,
    maxHeight: 58,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  gridStyle: {
    width: '100%',
    boxShadow: '0 1px 0 0 #f0f0f0 inset',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColStyle: {
    width: '100%',
    maxWidth: 350,
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: 5,
    rowGap: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  contentPStyle: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: '14px',
    lineHeight: '22px',
    color: 'rgba(0, 0, 0, 0.45)',
  },
  iconStyle: {
    marginRight: 8,
  },
  textStyle: {
    fontSize: '20px',
    lineHeight: '28px',
    textAlign: 'center',
    color: '#000000',
  },
};
