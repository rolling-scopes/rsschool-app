import { useRequest } from 'ahooks';
import { Descriptions, Divider, Form, Space, Switch, Tag, Typography } from 'antd';
import { AutoTestsApi, SelfEducationQuestionSelectedAnswersDto } from '@client/api';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import { Question } from 'modules/AutoTest/components';
import { SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { CourseRole } from 'services/models';

const api = new AutoTestsApi();

function Page() {
  const { courses } = useActiveCourseContext();
  const router = useRouter();

  const { data: selectedTask } = useRequest(async () => {
    const taskId = Number(router.query.taskId as string);
    if (Number.isNaN(taskId)) {
      return null;
    }
    const { data } = await api.getAutoTest(Number(router.query.taskId as string));
    return data;
  });

  useEffect(() => {
    if (selectedTask === null) {
      router.push('/404');
    }
  }, [selectedTask]);

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
          <Divider style={{ border: 'none', margin: '16px 0' }} />
          <Form layout="vertical" requiredMark={false} disabled={true}>
            {selectedTask?.attributes.public.questions.map((question, index) => (
              <Question
                key={index}
                question={
                  {
                    ...question,
                    // TODO: Investigate and fix potential type mismatch for selectedAnswers.
                    // Related issue: https://github.com/rolling-scopes/rsschool-app/issues/2572
                    selectedAnswers: selectedTask?.attributes.answers[index],
                  } as SelfEducationQuestionSelectedAnswersDto
                }
              />
            ))}
          </Form>
        </>
      )}
    </AdminPageLayout>
  );
}

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager]}>
      <Page />
    </SessionProvider>
  );
}
