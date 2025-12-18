import { message, Row, Spin, Modal } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { useMemo, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { InterviewDetails } from 'domain/interview';
import { SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CoursesInterviewsApi, CourseTaskDtoTypeEnum, InterviewCommentDto, InterviewDto, TaskDtoTypeEnum } from 'api';
import { InterviewCard, NoInterviewsAlert } from 'modules/Interview/Student';

const coursesInterviewApi = new CoursesInterviewsApi();

function StudentInterviewPage() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const courseService = useMemo(() => new CourseService(course.id), [course.id]);
  const [studentInterviews, setStudentInterviews] = useState<InterviewDetails[]>([]);
  const [commentsToStudent, setCommentsToStudent] = useState<InterviewCommentDto[]>([]);
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [registeredInterviews, setRegisteredInterviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  useAsync(async () => {
    try {
      setLoading(true);
      const [studentInterviews, { data: interviews }] = await Promise.all([
        courseService.getStudentInterviews(session.githubId),
        coursesInterviewApi.getInterviews(course.id, false, [
          TaskDtoTypeEnum.Interview,
          TaskDtoTypeEnum.StageInterview,
        ]),
      ] as const);
      const registeredInterviews = await getRegisteredInterviews(interviews);

      setStudentInterviews(studentInterviews);
      setInterviews(interviews);
      setRegisteredInterviews(registeredInterviews);

      const stageInterview = interviews.find(i => i.type === TaskDtoTypeEnum.StageInterview);

      if (stageInterview) {
        const { data: stageInterviewsCommentToStudent } = await coursesInterviewApi.getStageInterviewsCommentToStudent(
          course.id,
        );
        setCommentsToStudent(stageInterviewsCommentToStudent);
      }
    } catch {
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  }, [course.id]);

  const handleRegister = async (interviewId: string) => {
    modal.confirm({
      title: 'Are you ready to participate in the interview?',
      content: (
        <>
          You are committing to do the following:
          <ul>
            <li>Contact assigned interviewer in time</li>
            <li>Participate in the interview</li>
          </ul>
          NOTE: We DO NOT GUARANTEE you will get an interviewer. It depends on your score and how many mentors will be
          available.
        </>
      ),
      okText: 'Yes',
      onOk: async () => {
        try {
          await coursesInterviewApi.registerToInterview(course.id, Number(interviewId));
          setRegisteredInterviews(registeredInterviews.concat([interviewId]));
        } catch {
          message.error('An error occurred. Please try later.');
        }
      },
    });
  };

  const getRegisteredInterviews = async (interviews: InterviewDto[]) => {
    try {
      const requests = interviews.map(async ({ type, id }) => {
        const data =
          type === CourseTaskDtoTypeEnum.StageInterview
            ? await courseService.getInterviewStudent(session.githubId, 'stage').catch(() => null)
            : await courseService.getInterviewStudent(session.githubId, id.toString()).catch(() => null);
        return data ? id.toString() : null;
      });

      const result = await Promise.all(requests);
      return result.filter(id => id != null);
    } catch {
      message.error('Something went wrong, please try reloading the page later');
      return [];
    }
  };

  const hasInterview = (id: number) => registeredInterviews.includes(id.toString());

  const getStudentInterviewItems = (interviewName: string) => studentInterviews.filter(i => i.name === interviewName);

  return (
    <PageLayout loading={loading} title="Interviews" showCourseName>
      {contextHolder}
      <Spin spinning={loading}>
        {interviews.length === 0 ? (
          <NoInterviewsAlert />
        ) : (
          <Row gutter={[12, 12]} justify="start">
            {interviews.map(interview => {
              const { name, id } = interview;
              const items = getStudentInterviewItems(name);

              if (items.length > 0) {
                return items.map((item, index) => {
                  const interviewComment = commentsToStudent.find(comment => comment.id === item.id);
                  return (
                    <InterviewCard
                      key={item.id + index}
                      interview={interview}
                      comment={interviewComment?.commentToStudent}
                      item={item}
                      isRegistered={true}
                      onRegister={handleRegister}
                    />
                  );
                });
              }

              const registered = hasInterview(id);
              return (
                <InterviewCard
                  key={id}
                  interview={interview}
                  item={null}
                  isRegistered={registered}
                  onRegister={handleRegister}
                />
              );
            })}
          </Row>
        )}
      </Spin>
    </PageLayout>
  );
}

export default function () {
  return (
    <SessionProvider>
      <StudentInterviewPage />
    </SessionProvider>
  );
}
