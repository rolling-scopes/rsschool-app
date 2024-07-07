import { Checkbox, Descriptions, Divider, List, Result, Switch, Tag, Typography, message } from 'antd';
import { AutoTestTaskDto, AutoTestsApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { TASK_TYPES_MAP } from 'data/taskTypes';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { CourseRole } from 'services/models';

const api = new AutoTestsApi();

export interface AutoTestTask extends AutoTestTaskDto {
  attributes: Record<string, any>;
}

function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AutoTestTask>();
  const taskId = router?.query ? router.query?.taskId ?? null : null;
  const { courses } = useActiveCourseContext();

  useAsync(async () => {
    try {
      setIsLoading(true);
      if (!taskId) {
        throw new Error();
      }
      const { data } = await api.getRSSchoolAppTest(Number(taskId));
      if (data) {
        setSelectedTask(data);
      } else {
        throw new Error();
      }
    } catch (e) {
      message.error('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <AdminPageLayout title="Auto test task" loading={isLoading} courses={courses}>
      {!selectedTask && !isLoading ? (
        <Result status={'404'} title="Task doesn't exist" />
      ) : (
        <>
          <Descriptions column={1}>
            <Descriptions.Item label="ID">{selectedTask?.id}</Descriptions.Item>
            {selectedTask?.type && (
              <Descriptions.Item label="Type">{TASK_TYPES_MAP[selectedTask?.type]}</Descriptions.Item>
            )}
            {selectedTask?.descriptionUrl && (
              <Descriptions.Item label="Description URL">
                <a href={selectedTask?.descriptionUrl}>{selectedTask?.descriptionUrl}</a>
              </Descriptions.Item>
            )}
            {selectedTask?.discipline?.name && (
              <Descriptions.Item label="Discipline">{selectedTask?.discipline?.name}</Descriptions.Item>
            )}
            {selectedTask?.courses?.length && (
              <Descriptions.Item label="Courses">
                {selectedTask?.courses.map(course => (
                  <Tag color={course?.isActive ? 'green' : 'red'} key={course.name}>
                    <Typography.Text>{course.name}</Typography.Text>
                  </Tag>
                ))}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="GitHub PR Required">
              <Switch checked={selectedTask?.githubPrRequired} disabled />
            </Descriptions.Item>
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
              <Descriptions title="Test Settings" bordered column={4}>
                <Descriptions.Item label="Max Attempts Number">
                  {selectedTask?.attributes?.public?.maxAttemptsNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Number of Questions">
                  {selectedTask?.attributes?.public?.numberOfQuestions}
                </Descriptions.Item>
                <Descriptions.Item label="Strict Attempts Mode">
                  <Switch checked={selectedTask?.attributes?.public?.strictAttemptsMode} disabled />
                </Descriptions.Item>
                <Descriptions.Item label="Threshold Percentage">
                  {selectedTask?.attributes?.public?.tresholdPercentage}
                </Descriptions.Item>
              </Descriptions>
              <List
                itemLayout="horizontal"
                dataSource={selectedTask?.attributes.public.questions}
                renderItem={(item: Record<string, any>, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.question}
                      description={item.answers.map((answer: string, indexAnswer: number) => (
                        <Checkbox
                          key={indexAnswer}
                          checked={selectedTask?.attributes.answers[index].includes(indexAnswer)}
                        >
                          {answer}
                        </Checkbox>
                      ))}
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </>
      )}
    </AdminPageLayout>
  );
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]} adminOnly>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
