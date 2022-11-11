import React from 'react';
import { Button, message } from 'antd';
import { useLoading } from 'components/useLoading';
import { MentorsApi } from 'api';

interface Props {
  mentorId: number | null;
  courseId: number;
  onClick: () => void;
}

function ReviewRandomTask({ mentorId, courseId, onClick }: Props) {
  const [loading, withLoading] = useLoading(false, e => {
    const {
      response: { status },
    } = (e as any) || {};

    if (status > 300 && status < 500) {
      message.info('Task for review was not found. Please try later.');
    }
  });

  const handleClick = withLoading(async () => {
    if (mentorId) {
      const service = new MentorsApi();
      await service.getRandomTask(mentorId, courseId);
    }
    onClick();
  });

  return (
    <Button type="primary" loading={loading} disabled={loading} onClick={handleClick}>
      Review random task
    </Button>
  );
}

export default ReviewRandomTask;
