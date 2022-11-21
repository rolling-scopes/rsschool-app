import React from 'react';
import { Button, message } from 'antd';
import { useLoading } from 'components/useLoading';
import { MentorsApi } from 'api';
import { AxiosError } from 'axios';

interface Props {
  mentorId: number;
  courseId: number;
  onClick: () => void;
}

function ReviewRandomTask({ mentorId, courseId, onClick }: Props) {
  const [loading, withLoading] = useLoading(false, e => {
    const error = e as AxiosError;

    if (error.response?.status === 404) {
      message.info('Task for review was not found. Please try later.');
    }
  });

  const handleClick = withLoading(async () => {
    const service = new MentorsApi();
    await service.getRandomTask(mentorId, courseId);
    onClick();
  });

  return (
    <Button type="primary" loading={loading} disabled={loading} onClick={handleClick}>
      Review random task
    </Button>
  );
}

export default ReviewRandomTask;
