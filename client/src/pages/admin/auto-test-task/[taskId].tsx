import { Descriptions, Divider, Form, Space, Switch, Tag, Typography } from 'antd';
import { AutoTestTaskDto, AutoTestsApi, SelfEducationQuestionSelectedAnswersDto } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';
import { GetServerSideProps } from 'next';
import { getTokenFromContext } from 'utils/server';
import { getApiConfiguration } from 'utils/axios';
import { Question } from 'modules/AutoTest/components';

type PageProps = {
  selectedTask: AutoTestTaskDto;
};

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    const taskId = context.params?.taskId;

    if (!taskId) {
      throw new Error('task id is required');
    }

    const token = getTokenFromContext(context);
    const api = new AutoTestsApi(getApiConfiguration(token));
    const selectedTask = await api.getAutoTest(Number(taskId));

    if (!selectedTask.data) {
      return {
        props: {
          notFound: true,
        },
      };
    }

    return {
      props: { selectedTask: selectedTask.data },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};

function Page({ selectedTask }: PageProps) {
  const { courses } = useActiveCourseContext();

  return (
    <AdminPageLayout title="Auto test task" courses={courses} loading={false}>
      <Descriptions column={1}>
        <Descriptions.Item label="Name">{selectedTask?.name}</Descriptions.Item>
        {selectedTask?.descriptionUrl && (
          <Descriptions.Item label="Description URL">
            <a href={selectedTask?.descriptionUrl} target="_blank">
              {selectedTask?.descriptionUrl}
            </a>
          </Descriptions.Item>
        )}
        {selectedTask?.discipline?.name && (
          <Descriptions.Item label="Discipline">{selectedTask?.discipline?.name}</Descriptions.Item>
        )}
        {selectedTask?.courses?.length && selectedTask?.courses?.length > 0 && (
          <Descriptions.Item label="Courses">
            <Space wrap size="small">
              {selectedTask.courses.map(course => (
                <Tag color={course?.isActive ? 'green' : 'red'} key={course.name}>
                  <Typography.Text>{course.name}</Typography.Text>
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        )}

        {selectedTask?.tags && (
          <Descriptions.Item label="Tags">
            {selectedTask?.tags.map(tag => (
              <Tag color="blue" key={tag}>
                {tag}
              </Tag>
            ))}
          </Descriptions.Item>
        )}
      </Descriptions>

      {selectedTask?.attributes?.public?.questions && (
        <>
          <Divider />
          <Descriptions
            title="Test Settings"
            bordered
            size="small"
            column={{
              xs: 1,
              md: 2,
              lg: 3,
              xxl: 5,
            }}
          >
            <Descriptions.Item label="Max Attempts Number">
              {selectedTask?.attributes?.public?.maxAttemptsNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Number of Questions">
              {selectedTask?.attributes?.public?.numberOfQuestions}
            </Descriptions.Item>
            <Descriptions.Item label="Total Questions">
              {selectedTask?.attributes?.public?.questions?.length}
            </Descriptions.Item>
            <Descriptions.Item label="Strict Attempts Mode">
              <Switch checked={selectedTask?.attributes?.public?.strictAttemptsMode} disabled />
            </Descriptions.Item>
            <Descriptions.Item label="Threshold Percentage">
              {selectedTask?.attributes?.public?.tresholdPercentage}
            </Descriptions.Item>
          </Descriptions>
          <Form layout="vertical" requiredMark={false} disabled={true}>
            {selectedTask?.attributes.public.questions.map((question, index) => (
              <Question
                key={index}
                question={
                  {
                    ...question,
                    // TODO: Investigate and fix potential type mismatch for selectedAnswers.
                    // Related issue: https://github.com/rolling-scopes/rsschool-app/issues/2572
                    selectedAnswers: question.multiple
                      ? selectedTask?.attributes.answers[index]
                      : selectedTask?.attributes.answers[index][0],
                  } as SelfEducationQuestionSelectedAnswersDto
                }
                questionIndex={index}
              />
            ))}
          </Form>
        </>
      )}
    </AdminPageLayout>
  );
}

export default function (props: PageProps) {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]}>
        <Page {...props} />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
