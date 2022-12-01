import * as React from 'react';
import { TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { Card, Typography, Image } from 'antd';
import CommonCard from './CommonDashboardCard';

const DEFAULT_POSITION = 999999;

const { Text } = Typography;

type Props = {
  isActive: boolean;
  totalScore: number;
  position: number;
  maxCourseScore: number;
  totalStudentsCount: number;
};

export function MainStatsCard({ totalScore, position, maxCourseScore, totalStudentsCount }: Props) {
  const currentPositionText = `${position}${totalStudentsCount ? ` / ${totalStudentsCount}` : ''}`;
  const positionText = position >= DEFAULT_POSITION ? 'New' : currentPositionText;
  const totalScoreText = `${totalScore}${maxCourseScore ? ` / ${maxCourseScore}` : ''}`;
  const { gridStyle, contentColStyle, contentDivStyle, iconStyle, textStyle } = STYLE;

  return (
    <CommonCard
      title="Your stats"
      bodyStyle={{ padding: 0 }}
      content={
        <>
          <Card.Grid hoverable={false} style={gridStyle}>
            <Image preview={false} src="/static/images/im-fine.svg" />
          </Card.Grid>
          <Card.Grid hoverable={false} style={gridStyle}>
            <div style={contentColStyle}>
              <div style={contentDivStyle}>
                <Text type="secondary">
                  <TrophyOutlined style={iconStyle} />
                  Position
                </Text>
                <Text strong style={textStyle}>
                  {positionText}
                </Text>
              </div>
              <div style={contentDivStyle}>
                <Text type="secondary">
                  <FireOutlined style={iconStyle} />
                  Total Score
                </Text>
                <Text strong style={textStyle}>
                  {totalScoreText}
                </Text>
              </div>
            </div>
          </Card.Grid>
        </>
      }
    />
  );
}

const STYLE: Record<string, React.CSSProperties> = {
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
    padding: 16,
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
  iconStyle: {
    marginRight: 8,
  },
  textStyle: {
    fontSize: '20px',
    lineHeight: '28px',
    textAlign: 'center',
  },
};
