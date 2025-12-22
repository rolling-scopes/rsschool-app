import { Button, Row, Space, Typography } from 'antd';
import { UserSwitchOutlined, UserAddOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { MentorInterview } from 'services/course';
import { InterviewDto } from '@client/api';
import { getInterviewWaitList, isTechnicalScreening } from 'domain/interview';
import { SelectMentorModal } from './SelectMentorModal';
import { useAsyncFn } from 'react-use';
import { CourseService } from 'services/course';

export function InterviewsSummary({
  interviews,
  toggleDetails,
  interviewTask,
  courseId,
  reloadList,
  courseAlias,
}: {
  interviewTask: InterviewDto;
  interviews: MentorInterview[];
  toggleDetails: () => void;
  courseId: number;
  courseAlias: string;
  reloadList: () => Promise<void>;
}) {
  const totalCompleted = useMemo(() => interviews.filter(interview => interview.completed).length, [interviews]);
  const canTransfer = useMemo(
    () => interviews.some(studentInterview => !studentInterview.completed && isTechnicalScreening(interviewTask.name)),
    [interviewTask.name, interviews],
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
        <Button icon={<UserAddOutlined />} href={getInterviewWaitList(courseAlias, interviewTask.id)}>
          Add student
        </Button>
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
