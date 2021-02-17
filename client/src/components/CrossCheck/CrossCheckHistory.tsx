import { ClockCircleOutlined, StarTwoTone } from '@ant-design/icons';
import { Spin, Timeline, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { CourseService } from 'services/course';
import { formatDateTime } from 'services/formatter';

type HistoryItem = { comment: string; score: number; dateTime: number };

export function CrossCheckHistory(props: { githubId: string | null; courseId: number; courseTaskId: number | null }) {
  if (props.githubId == null || props.courseTaskId == null) {
    return null;
  }
  const githubId = props.githubId;
  const courseTaskId = props.courseTaskId;

  const [state, setState] = useState({ loading: false, data: [] as HistoryItem[] });

  const loadStudentScoreHistory = async (githubId: string) => {
    const courseService = new CourseService(props.courseId);
    setState({ loading: true, data: [] });
    const result = await courseService.getTaskSolutionResult(githubId, courseTaskId);
    setState({ loading: false, data: result?.historicalScores?.sort((a, b) => b.dateTime - a.dateTime) ?? [] });
  };

  useEffect(() => {
    loadStudentScoreHistory(githubId);
  }, [githubId]);

  return (
    <Spin spinning={state.loading}>
      <Typography.Title style={{ marginTop: 24 }} level={4}>
        History
      </Typography.Title>
      <Timeline>
        {state.data.map((historyItem, i) => (
          <Timeline.Item
            key={i}
            color={i === 0 ? 'green' : 'gray'}
            dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
          >
            <div>{formatDateTime(historyItem.dateTime)}</div>
            <div>
              <StarTwoTone twoToneColor={i === 0 ? '#52c41a' : 'gray'} />{' '}
              <Typography.Text>{historyItem.score}</Typography.Text>
            </div>
            <div>
              <Typography.Text>
                {historyItem.comment.split('\n').map((item, i) => (
                  <div key={i}>{item}</div>
                ))}
              </Typography.Text>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Spin>
  );
}
