import { Button, message } from 'antd';
import { useRequest } from 'ahooks';
import { MentorsApi } from '@client/api';
import { AxiosError } from 'axios';
import { EyeOutlined } from '@ant-design/icons';

interface Props {
  mentorId: number;
  courseId: number;
  onClick: () => void;
}

function ReviewRandomTask({ mentorId, courseId, onClick }: Props) {
  const reviewRandomTaskRequest = useRequest(
    async () => {
      const service = new MentorsApi();
      await service.getRandomTask(mentorId, courseId);
      onClick();
    },
    {
      manual: true,
      onError: e => {
        const error = e as AxiosError;

        if (error.response?.status === 404) {
          message.info('Task for review was not found. Please try later.');
        }
      },
    },
  );

  return (
    <Button
      type="primary"
      icon={<EyeOutlined />}
      loading={reviewRandomTaskRequest.loading}
      disabled={reviewRandomTaskRequest.loading}
      onClick={reviewRandomTaskRequest.runAsync}
    >
      Review random task
    </Button>
  );
}

export default ReviewRandomTask;
