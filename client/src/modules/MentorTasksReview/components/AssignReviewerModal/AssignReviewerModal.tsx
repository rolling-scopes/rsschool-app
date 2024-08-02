import { Col, Form, Row, Typography } from 'antd';
import React, { useState } from 'react';
import { ModalSubmitForm } from 'components/Forms/ModalSubmitForm';
import { MentorReviewDto, MentorReviewsApi } from 'api';
import isEmpty from 'lodash/isEmpty';
import { MentorSearch } from 'components/MentorSearch';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { useLoading } from 'components/useLoading';

const mentorReviewsApi = new MentorReviewsApi();

export interface AssignReviewerModalProps {
  review: MentorReviewDto | null;
  onClose: () => void;
  onSubmit: () => void;
}

const { Link } = Typography;

const MODAL_TITLE = 'Assign Reviewer for';
const SUCCESS_MESSAGE = 'Reviewer has been successfully assigned';

function AssignReviewerModal({ review, onClose, onSubmit }: AssignReviewerModalProps) {
  const { course } = useActiveCourseContext();
  const [loading, withLoading] = useLoading(false);

  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState('');

  const courseId = course.id;
  const { solutionUrl, taskDescriptionUrl, taskName, student, taskId, studentId } = review || {};

  const assignReviewer = withLoading(async (courseId, courseTaskId, mentorId, studentId) => {
    await mentorReviewsApi.assignReviewer(courseId, { courseTaskId, mentorId, studentId });
  });

  const handleSubmit = async (values: any) => {
    const { mentorId } = values;
    try {
      if (mentorId) {
        await assignReviewer(course.id, taskId, mentorId, studentId);
        setSubmitted(true);
        onSubmit();
      }
    } catch (e: any) {
      const error = e.response?.data?.message ?? e.message;
      setErrorText(error);
    }
  };

  const handleClose = () => {
    setErrorText('');
    setSubmitted(false);
    onClose();
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
          <Form.Item label="Task Name">
            <Link href={taskDescriptionUrl} target="_blank">
              {taskName}
            </Link>
          </Form.Item>
          <Form.Item label="Submitted Link">
            <Link href={solutionUrl} target="_blank">
              {solutionUrl}
            </Link>
          </Form.Item>
          <Form.Item name="mentorId" rules={[{ required: true, message: 'Please select  mentor' }]} label="Mentor">
            <MentorSearch keyField="id" courseId={courseId} />
          </Form.Item>
        </Col>
      </Row>
    </ModalSubmitForm>
  );
}

export default AssignReviewerModal;
