import { Form, Typography } from 'antd';
import React, { useState } from 'react';
import { ModalSubmitForm } from 'components/Forms/ModalSubmitForm';
import { ScoreInput } from 'components/Forms';

interface SubmitReviewModalProps {
  maxScore: number;
  studentName: string;
  prUrl: string;
  taskName: string;
  taskDescriptionUrl: string;
  githubId: string;
  courseTaskId: number;
}

const { Link } = Typography;

function SubmitReviewModal({
  maxScore,
  studentName,
  prUrl,
  taskName,
  taskDescriptionUrl,
  githubId,
  courseTaskId,
}: SubmitReviewModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: any) => {
    console.log(githubId, courseTaskId);
    console.log(values);
    // const score = values.score;
    // await courseService.postStudentScore(githubId, courseTaskId, data);
    return false;
  };

  const handleClose = () => {
    setScore(undefined);
    setSubmitted(false);
    setErrorText('');
    setLoading(false);
  };

  return (
    <ModalSubmitForm
      title={`Submit Review for ${studentName}`}
      data={score}
      submitted={submitted}
      submit={handleSubmit}
      close={handleClose}
      errorText={errorText}
      loading={loading}
    >
      <Form.Item label="Task" name="task" required>
        <Link href={taskDescriptionUrl} target="_blank">
          {taskName}
        </Link>
      </Form.Item>
      <Form.Item label="Github Pull Request URL" name="prUrl" required>
        <Link href={prUrl} target="_blank">
          {prUrl}
        </Link>
      </Form.Item>
      <ScoreInput maxScore={maxScore} />
    </ModalSubmitForm>
  );
}

export default SubmitReviewModal;
