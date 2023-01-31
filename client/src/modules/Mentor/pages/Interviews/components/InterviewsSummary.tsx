import { Button, Row, Space, Typography } from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { MentorInterview } from 'services/course';
import { InterviewDto } from 'api';
import { isTechnicalScreening } from 'domain/interview';
import { SelectMentorModal } from './SelectMentorModal';
import { useAsyncFn } from 'react-use';
import { CourseService } from 'services/course';

export function InterviewsSummary({
  interviews,
  toggleDetails,
  interview,
  courseId,
  reloadList,
}: {
  interview: InterviewDto;
  interviews: MentorInterview[];
  toggleDetails: () => void;
  courseId: number;
  reloadList: () => Promise<void>;
}) {
  const totalCompleted = useMemo(() => interviews.filter(interview => interview.completed).length, [interviews]);
  const canTransfer = useMemo(
    () => interviews.some(studentInterview => !studentInterview.completed && isTechnicalScreening(interview.name)),
    [interview.name],
  );
  const [showTransfer, setShowTransfer] = useState(false);

  const [, transfer] = useAsyncFn(async (githubId: string, interviewId: number) => {
    await new CourseService(courseId).updateStageInterview(interviewId, { githubId });
    await reloadList();
    setShowTransfer(false);
  }, []);

  return (
    <Row justify="space-between">
      <Row>
        <Typography.Title level={4}>
          Interviewed students {totalCompleted}({interviews.length})
        </Typography.Title>{' '}
        <Button type="link" onClick={toggleDetails}>
          Show details
        </Button>
      </Row>
      <Space size={'small'}>
        {canTransfer && (
          <Button icon={<UserSwitchOutlined />} onClick={() => setShowTransfer(true)}>
            Transfer student
          </Button>
        )}
      </Space>
      {showTransfer && (
        <SelectMentorModal
          courseId={courseId}
          interviews={interviews.filter(interview => !interview.completed)}
          onCancel={() => setShowTransfer(false)}
          onOk={transfer}
        />
      )}
    </Row>
  );
}
