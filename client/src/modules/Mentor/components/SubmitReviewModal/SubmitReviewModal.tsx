import { Form, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import { ModalSubmitForm } from 'components/Forms/ModalSubmitForm';
import { ScoreInput } from 'components/Forms';
import { MentorDashboardDto } from 'api';
import { CourseService } from 'services/course';
import { isEmpty } from 'lodash';

export interface SubmitReviewModalProps {
  data: MentorDashboardDto | null;
  courseId: number;
  onClose: () => void;
  onSubmit: () => void;
}

const { Link } = Typography;

function SubmitReviewModal({ data, courseId, onClose, onSubmit }: SubmitReviewModalProps) {
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    if (data) {
      try {
        await courseService.postStudentScore(data.studentGithubId, data.courseTaskId, {
          score: values.score,
          githubPrUrl: data.solutionUrl,
        });
        onSubmit();
      } catch (e: any) {
        const error = e.response?.data?.message ?? e.message;
        setErrorText(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setErrorText('');
    setLoading(false);
    onClose();
  };

  return (
    <ModalSubmitForm
      title={`Submit Review for ${data?.studentName}`}
      data={data}
      submit={handleSubmit}
      close={handleClose}
      errorText={errorText}
      loading={loading}
      open={!isEmpty(data)}
    >
      <Form.Item label="Task" name="task">
        <Link href={data?.taskDescriptionUrl} target="_blank">
          {data?.taskName}
        </Link>
      </Form.Item>
      <Form.Item label="Github Pull Request URL" name="prUrl">
        <Link href={data?.solutionUrl} target="_blank">
          {data?.solutionUrl}
        </Link>
      </Form.Item>
      <ScoreInput maxScore={data?.maxScore} />
    </ModalSubmitForm>
  );
}

export default SubmitReviewModal;
