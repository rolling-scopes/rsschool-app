import { Col, Form, Row, Typography } from 'antd';
import React, { useState } from 'react';
import { ModalSubmitForm } from 'components/Forms/ModalSubmitForm';
import { MentorReviewDto } from 'api';
import isEmpty from 'lodash/isEmpty';
import { MentorSearch } from 'components/MentorSearch';

export interface AssignReviewerModalProps {
  review: MentorReviewDto | null;
  courseId: number;
  onClose: (d: MentorReviewDto | null) => void;
  // onSubmit: () => void;
}

const { Link } = Typography;

const MODAL_TITLE = 'Assign Reviewer for';
const SUCCESS_MESSAGE = 'Reviewer has been successfully assigned';

function AssignReviewerModal({ review, courseId, onClose }: AssignReviewerModalProps) {
  const { solutionUrl, taskDescriptionUrl, taskName, student } = review || {};

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');

  // const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (student) {
        setSubmitted(true);
        // onSubmit();
      }
    } catch (e: any) {
      const error = e.response?.data?.message ?? e.message;
      setErrorText(error);
    } finally {
      setLoading(false);
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
      title={`${MODAL_TITLE} ${student}`}
      data={review}
      submit={handleSubmit}
      close={handleClose}
      errorText={errorText}
      loading={loading}
      submitted={submitted}
      successText={SUCCESS_MESSAGE}
      open={!isEmpty(review)}
    >
      <Row>
        <Col span={18} offset={3}>
          <Form.Item label="Task Name" name="task">
            <Link href={taskDescriptionUrl} target="_blank">
              {taskName}
            </Link>
          </Form.Item>
          <Form.Item label="Submitted Link" name="prUrl">
            <Link href={solutionUrl} target="_blank">
              {solutionUrl}
            </Link>
          </Form.Item>
          <Form.Item name="githubId" rules={[{ required: true, message: 'Please select  mentor' }]} label="Mentor">
            <MentorSearch keyField="githubId" courseId={courseId} />
          </Form.Item>
        </Col>
      </Row>
    </ModalSubmitForm>
  );
}

export default AssignReviewerModal;
