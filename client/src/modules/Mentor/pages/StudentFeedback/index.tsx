import { PageLayoutSimple } from 'components/PageLayout';
import { getMentorId } from 'domain/user';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { useMentorStudents } from 'modules/Mentor/hooks/useMentorStudents';
import { useContext } from 'react';
import { CreateStudentFeedbackDto, StudentsFeedbacksApi } from 'api';
import { FeedbackForm } from 'modules/Feedback/components/FeedbackForm';
import { useRouter } from 'next/router';
import { useMessage } from 'hooks';

const api = new StudentsFeedbacksApi();

export function StudentFeedback() {
  const { message } = useMessage();
  const { course } = useActiveCourseContext();
  const session = useContext(SessionContext);
  const { id: courseId } = course;
  const mentorId = getMentorId(session, courseId);

  const router = useRouter();
  const studentId = router.query['studentId'] ? Number(router.query['studentId']) : null;

  const { students, loading, reload } = useMentorStudents(mentorId, courseId);

  const handleMentorSubmit = async (
    studentId: number,
    payload: CreateStudentFeedbackDto,
    existingFeedbackId?: number,
  ) => {
    if (existingFeedbackId) {
      try {
        await api.updateStudentFeedback(studentId, existingFeedbackId, payload);
        message.success('Feedback has been successfully updated');
      } catch {
        message.error('Failed to update feedback');
      }
    } else {
      try {
        await api.createStudentFeedback(studentId, payload);
        message.success('Feedback has been successfully submitted');
      } catch {
        message.error('Failed to submit feedback');
      }
    }
    await reload();
  };

  return (
    <PageLayoutSimple noData={students?.length === 0} title="Recommendation Letter" loading={loading}>
      {studentId && <FeedbackForm students={students} studentId={studentId} onSubmit={handleMentorSubmit} />}
    </PageLayoutSimple>
  );
}
