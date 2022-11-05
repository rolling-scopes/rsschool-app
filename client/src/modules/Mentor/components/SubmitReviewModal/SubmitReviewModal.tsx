import { Col, Form, Row, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import { ModalSubmitForm } from 'components/Forms/ModalSubmitForm';
import { ScoreInput } from 'components/Forms';
import { MentorDashboardDto } from 'api';
import { CourseService } from 'services/course';
import { isEmpty } from 'lodash';

export interface SubmitReviewModalProps {
  data: MentorDashboardDto | null;
  courseId: number;
  onClose: (d: MentorDashboardDto | null) => void;
  onSubmit: () => void;
}

const { Link } = Typography;

export const MODAL_TITLE = 'Submit Score for';
export const SUCCESS_MESSAGE = 'Your review has been successfully submitted';

function SubmitReviewModal({ data, courseId, onClose, onSubmit }: SubmitReviewModalProps) {
  const { studentGithubId, courseTaskId, solutionUrl, studentName, taskDescriptionUrl, taskName, maxScore } =
    data || {};

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      if (studentGithubId && courseTaskId) {
        await courseService.postStudentScore(studentGithubId, courseTaskId, {
          score: values.score,
          githubPrUrl: solutionUrl,
        });
        setLoading(false);
        setSubmitted(true);
        onSubmit();
      }
    } catch (e: any) {
      const error = e.response?.data?.message ?? e.message;
      setLoading(false);
      setErrorText(error);
    }
  };

  const handleClose = () => {
    setErrorText('');
    setLoading(false);
    setSubmitted(false);
    onClose(null);
  };

  return (
    <ModalSubmitForm
      title={`${MODAL_TITLE} ${studentName}`}
      data={data}
      submit={handleSubmit}
      close={handleClose}
      errorText={errorText}
      loading={loading}
      submitted={submitted}
      successText={SUCCESS_MESSAGE}
      open={!isEmpty(data)}
    >
      <Row>
        <Col span={18} offset={3}>
          <Form.Item label="Task" name="task">
            <Link href={taskDescriptionUrl} target="_blank">
              {taskName}
            </Link>
          </Form.Item>
          <Form.Item label="Github Pull Request" name="prUrl">
            <Link href={solutionUrl} target="_blank">
              {solutionUrl}
            </Link>
          </Form.Item>
          <ScoreInput maxScore={maxScore} style={{ width: '100%' }} />
        </Col>
      </Row>
    </ModalSubmitForm>
  );
}

export default SubmitReviewModal;
