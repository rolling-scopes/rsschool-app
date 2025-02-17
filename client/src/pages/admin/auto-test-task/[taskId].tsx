import { useState } from 'react';
import { Button, Descriptions, Divider, Form, message, Space, Switch, Tag, Typography } from 'antd';
import { AutoTestTaskDto, AutoTestsApi, SelfEducationQuestionSelectedAnswersDto, TasksApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';
import { GetServerSideProps } from 'next';
import { getTokenFromContext } from 'utils/server';
import { getApiConfiguration } from 'utils/axios';
import { Question } from 'modules/AutoTest/components';
import AutoTestForm from 'modules/AutoTest/components/AutoTestForm/AutoTestForm';

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
      return { props: { notFound: true } };
    }

    return { props: { selectedTask: selectedTask.data } };
  } catch {
    return { notFound: true };
  }
};

const taskApi = new TasksApi();

function Page({ selectedTask }: PageProps) {
  const { courses } = useActiveCourseContext();
  const [task, setTask] = useState<AutoTestTaskDto>(selectedTask);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveTask = async (updatedTask: AutoTestTaskDto) => {
    try {
      await taskApi.updateTask(updatedTask.id, {
        name: selectedTask.name,
        descriptionUrl: selectedTask.descriptionUrl,
        disciplineId: selectedTask.discipline?.id,
        tags: selectedTask.tags,
        attributes: updatedTask.attributes,
        description: selectedTask.description,
        githubRepoName: selectedTask.githubRepoName,
        sourceGithubRepoUrl: selectedTask.sourceGithubRepoUrl,
        githubPrRequired: selectedTask.githubPrRequired,
        type: selectedTask.type,
        skills: selectedTask.skills,
      });
      setTask(updatedTask);
      setIsEditing(false);
    } catch (error) {
      message.error('Failed to update auto test');
    }
  };

  return (
    <AdminPageLayout title="Auto test" courses={courses} loading={false}>
      {isEditing ? (
        <AutoTestForm selectedTask={task} onCancel={() => setIsEditing(false)} onSave={handleSaveTask} />
      ) : (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </Space>
          <Descriptions column={1}>
            <Descriptions.Item label="Name">{task.name}</Descriptions.Item>
            {task?.descriptionUrl && (
              <Descriptions.Item label="Description URL">
                <a href={task?.descriptionUrl} target="_blank" rel="noreferrer">
                  {task?.descriptionUrl}
                </a>
              </Descriptions.Item>
            )}
            {task?.discipline?.name && (
              <Descriptions.Item label="Discipline">{task?.discipline?.name}</Descriptions.Item>
            )}
            {task?.courses?.length && task?.courses?.length > 0 && (
              <Descriptions.Item label="Courses">
                <Space wrap size="small">
                  {task.courses.map(course => (
                    <Tag color={course?.isActive ? 'green' : 'red'} key={course.name}>
                      <Typography.Text>{course.name}</Typography.Text>
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
            {task?.tags && (
              <Descriptions.Item label="Tags">
                {task?.tags.map(tag => (
                  <Tag color="blue" key={tag}>
                    {tag}
                  </Tag>
                ))}
              </Descriptions.Item>
            )}
          </Descriptions>
          {task?.attributes?.public?.questions && (
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
                  {task.attributes.public.maxAttemptsNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Number of Questions">
                  {task.attributes.public.numberOfQuestions}
                </Descriptions.Item>
                <Descriptions.Item label="Total Questions">{task.attributes.public.questions.length}</Descriptions.Item>
                <Descriptions.Item label="Strict Attempts Mode">
                  <Switch checked={task.attributes.public.strictAttemptsMode} disabled />
                </Descriptions.Item>
                <Descriptions.Item label="Threshold Percentage">
                  {task.attributes.public.tresholdPercentage}
                </Descriptions.Item>
              </Descriptions>
              <Form layout="vertical" requiredMark={false} disabled>
                {task.attributes.public.questions.map((question, index) => (
                  <Question
                    key={index}
                    question={
                      {
                        ...question,
                        selectedAnswers: question.multiple
                          ? task.attributes.answers[index]
                          : task.attributes.answers[index][0],
                      } as SelfEducationQuestionSelectedAnswersDto
                    }
                    questionIndex={index}
                  />
                ))}
              </Form>
            </>
          )}
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
