import React from 'react';
import { Button } from 'antd';
import { useLoading } from 'components/useLoading';
import { MentorsApi } from 'api';

interface Props {
  mentorId: number | null;
  courseId: number;
}

function ReviewRandomTask({ mentorId, courseId }: Props) {
  const [loading, withLoading] = useLoading();

  const handleClick = withLoading(async () => {
    if (mentorId) {
      const service = new MentorsApi();
      await service.getRandomTask(mentorId, courseId);
    }
  });

  return (
    <Button type="primary" loading={loading} disabled={loading} onClick={handleClick}>
      Review random task
    </Button>
  );
}

export default ReviewRandomTask;
