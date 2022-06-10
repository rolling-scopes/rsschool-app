import { CheckSquareTwoTone, CloseSquareTwoTone, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, message, notification, Radio, Row, Table, Typography, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { CoursesTasksApi, CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum, CourseTaskDto } from 'api';
import { AxiosError } from 'axios';
import { CourseTaskSelect } from 'components/Forms';
import { PageLayout } from 'components/PageLayout';
import { shortDateTimeRenderer } from 'components/Table';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import shuffle from 'lodash/shuffle';
import snakeCase from 'lodash/snakeCase';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { useAsync, useBeforeUnload } from 'react-use';
import {
  CourseService,
  SelfEducationPublicAttributes,
  SelfEducationQuestion,
  SelfEducationQuestionWithIndex,
  Verification,
} from 'services/course';
import { FilesService } from 'services/files';
import { CoursePageProps } from 'services/models';
import { notUrlPattern } from 'services/validators';

const courseTasksApi = new CoursesTasksApi();

const parseCourseTask = (courseTask: CourseTaskDetailedDto) => {
  if (courseTask?.type === CourseTaskDetailedDtoTypeEnum.Selfeducation) {
    const pubAttrs = (courseTask.publicAttributes ?? {}) as Record<string, any>;
    return {
      ...courseTask,
      publicAttributes: {
        ...pubAttrs,
        questions: getRandomQuestions(pubAttrs.questions || []).slice(0, pubAttrs.numberOfQuestions),
      },
    };
  }
  return courseTask;
};

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [courseTasks, setCourseTasks] = useState<CourseTaskDto[]>([]);
  const [courseTask, setCourseTask] = useState<CourseTaskDetailedDto | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);

  const [isModified, setIsModified] = useState(false);

  useBeforeUnload(isModified, 'You have changes in test! Do you realy want to close this page?');

  useAsync(async () => {
    try {
      setLoading(true);
      loadVerifications();
      const { data: tasks } = await courseTasksApi.getCourseTasks(courseId, 'inprogress');
      const courseTasks = filterAutoTestTasks(tasks);
      setCourseTasks(courseTasks);
    } catch {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
      setIsModified(false);
    }
  }, []);

  useAsync(async () => {
    const { data: couseTask } = courseTaskId
      ? await courseTasksApi.getCourseTask(courseId, courseTaskId)
      : { data: null };
    setCourseTask(couseTask ? parseCourseTask(couseTask) : couseTask);
  }, [courseTaskId]);

  const handleSubmit = async (values: any) => {
    if (!courseTask || !courseTaskId) {
      return;
    }
    try {
      let data: any = {};
      if (courseTask.type === CourseTaskDetailedDtoTypeEnum.Ipynb) {
        const filesService = new FilesService();
        const fileData = await readFile(values.upload.file);
        const { s3Key } = await filesService.uploadFile('', fileData);
        data = {
          s3Key,
          taskName: snakeCase(courseTask.name),
        };
      } else {
        data = getSubmitData(courseTask, values);
        if (data == null) {
          return;
        }
      }

      setLoading(true);

      const {
        courseTask: { type },
      } = await courseService.postTaskVerification(courseTaskId, data);

      if (type === 'selfeducation') {
        message.success('The task has been submitted.');
        loadVerifications();
      } else {
        message.success('The task has been submitted for verification and it will be checked soon.');
      }

      setIsModified(false);
      form.resetFields();
    } catch (e) {
      const error = e as AxiosError<any>;
      if (error.response?.status === 429) {
        notification.warn({
          message: (
            <>Please wait. You will be able to submit your task again when the current verification is completed.</>
          ),
        });
        return;
      }
      if (error.response?.status === 423) {
        notification.error({
          message: <>Please reload page. This task was expired for submit.</>,
        });
        return;
      }
      if (error.response?.status === 403) {
        const pubAtts = (courseTask?.publicAttributes ?? {}) as SelfEducationPublicAttributes;
        const oneAttemptPerNumberOfHours = pubAtts.oneAttemptPerNumberOfHours;
        notification.error({
          message: (
            <>
              You can submit this task only {pubAtts.maxAttemptsNumber || 0} times.{' '}
              {!!oneAttemptPerNumberOfHours &&
                `You can submit this task not more than one time per ${oneAttemptPerNumberOfHours} hour${
                  oneAttemptPerNumberOfHours !== 1 && 's'
                } `}
              For now your attempts limit is over!
            </>
          ),
        });
        form.resetFields();
        return;
      }
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
      setCourseTaskId(null);
    }
  };

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const data = await courseService.getTaskVerifications();
      setVerifications(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseTaskChange = (courseTaskId: number) => {
    if (courseTask?.type === 'selfeducation') {
      form.resetFields();
    }

    setIsModified(false);
    setCourseTaskId(courseTaskId);
    form.setFieldsValue({ courseTaskId });
    loadVerifications();
  };

  return (
    <PageLayout loading={loading} title="Auto-Test" courseName={props.course.name} githubId={props.session.githubId}>
      <Row gutter={24}>
        <Col style={{ marginBottom: 32 }} xs={24} sm={18} md={12} lg={10}>
          <Form form={form} onFinish={handleSubmit} layout="vertical" onChange={() => setIsModified(true)}>
            <CourseTaskSelect onChange={handleCourseTaskChange} groupBy="deadline" data={courseTasks} />
            {courseTask ? renderTaskFields(props.session.githubId, courseTask, verifications) : null}
            <Row>
              <Button size="large" type="primary" htmlType="submit">
                Submit
              </Button>
            </Row>
          </Form>
        </Col>
        <Col xs={24} sm={20} md={18} lg={14}>
          <Row justify="space-between">
            <Typography.Title type="secondary" level={4}>
              Verification Results
            </Typography.Title>
            <Button type="dashed" onClick={loadVerifications} icon={<ReloadOutlined />}>
              Refresh
            </Button>
          </Row>
          <Table
            size="small"
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Date/Time',
                dataIndex: 'createdDate',
                render: shortDateTimeRenderer,
                width: 100,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                width: 100,
              },
              {
                title: 'Task Name',
                dataIndex: ['courseTask', 'task', 'name'],
                ellipsis: true,
                width: 150,
              },
              {
                title: 'Score',
                dataIndex: 'score',
                width: 60,
              },
              {
                title: 'Details',
                dataIndex: 'details',
                render: (value: string, item) => {
                  if (item?.courseTask?.type === 'codewars') {
                    return (
                      <>
                        <Typography.Text>{value}</Typography.Text>
                        <div>
                          {(item?.metadata as { id: string; url: string; name: string; completed: boolean }[])?.map(
                            ({ id, url, name, completed }, index: number) => (
                              <div key={id}>
                                <Typography.Link href={url} target="_blank">
                                  {completed ? (
                                    <CheckSquareTwoTone twoToneColor="#52c41a" />
                                  ) : (
                                    <CloseSquareTwoTone twoToneColor="#ff4d4f" />
                                  )}{' '}
                                  {index}. {name}
                                </Typography.Link>
                              </div>
                            ),
                          )}
                        </div>
                      </>
                    );
                  }

                  return typeof value === 'string' ? value.split('\\n').map(str => <div key={str}>{str}</div>) : value;
                },
              },
            ]}
            dataSource={verifications}
          />
        </Col>
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));

function readFile(file: any) {
  return new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.readAsText(file.originFileObj, 'utf-8');
    reader.onload = ({ target }) => res(target ? (target.result as string) : '');
    reader.onerror = e => rej(e);
  });
}

function UploadJupyterNotebook() {
  const [uploadFile, setUploadFile] = useState<UploadFile | null>(null);
  const handleFileChose = async (info: any) => setUploadFile(info.file);
  return (
    <Form.Item name="upload">
      <Upload fileList={uploadFile ? [uploadFile] : []} onChange={handleFileChose} multiple={false}>
        <Button>
          <UploadOutlined /> Select Jupyter Notebook
        </Button>
      </Upload>
    </Form.Item>
  );
}

function renderTaskFields(githubId: string, courseTask: CourseTaskDetailedDto, verifications: Verification[]) {
  const repoUrl = `https://github.com/${githubId}/${courseTask?.githubRepoName}`;
  switch (courseTask?.type) {
    case CourseTaskDetailedDtoTypeEnum.Jstask:
      return renderJsTaskFields(repoUrl);
    case CourseTaskDetailedDtoTypeEnum.Kotlintask:
    case CourseTaskDetailedDtoTypeEnum.Objctask:
      return renderKotlinTaskFields(repoUrl);
    case CourseTaskDetailedDtoTypeEnum.Ipynb:
      return (
        <Row>
          <UploadJupyterNotebook />
        </Row>
      );
    case CourseTaskDetailedDtoTypeEnum.Selfeducation:
      return (
        <>
          {renderDescription(courseTask?.descriptionUrl)}
          {renderSelfEducation(courseTask, verifications)}
        </>
      );
    case CourseTaskDetailedDtoTypeEnum.Codewars: {
      return (
        <>
          {renderDescription(courseTask.descriptionUrl)}
          {explanationsSubmissionTasks()}
          <Form.Item
            name="codewars"
            label="Codewars Account"
            rules={[{ pattern: notUrlPattern, message: 'Enter valid Codewars account' }]}
          >
            <Input style={{ maxWidth: 250 }} placeholder="username" />
          </Form.Item>
        </>
      );
    }
    default:
      return null;
  }
}

function getAttemptsLeftMessage(value: number, strictAttemptsMode: boolean) {
  if (value === 1) {
    return `Only 1 attempt left. Be carefull, It's your last attempt!`;
  }
  if (value > 1) {
    return `${value} attempts left.`;
  }
  if (strictAttemptsMode) {
    return 'You have no more attempts.';
  }
  return 'Limit of "free" attempts is over. Now you can get only half a score.';
}

function getTimeToTheNextSubmit(hours: number, lastAttemptTime?: string) {
  if (!hours || !lastAttemptTime) return 0;
  const diff = moment(lastAttemptTime).diff(moment().subtract(hours, 'hour'));
  if (diff < 0) return 0;
  return diff;
}

function formatMiliseconds(ms: number) {
  return moment.utc(ms).format('HH:mm:ss');
}

function renderSelfEducation(courseTask: CourseTaskDetailedDto, verifications: Verification[]) {
  const pubAtts = (courseTask?.publicAttributes ?? {}) as Record<string, any>;
  const questions = (pubAtts.questions as SelfEducationQuestionWithIndex[]) || [];
  const {
    maxAttemptsNumber = 0,
    tresholdPercentage = 0,
    strictAttemptsMode = true,
    oneAttemptPerNumberOfHours = 0,
  } = pubAtts as SelfEducationPublicAttributes;

  const attempts = verifications.filter(v => courseTask?.id === v.courseTaskId);
  const attemptsLeft = maxAttemptsNumber - attempts.length;
  const [lastAttempt] = attempts;
  const lastAttemptTime = lastAttempt?.createdDate;
  const timeToTheNextSubmit = getTimeToTheNextSubmit(oneAttemptPerNumberOfHours, lastAttemptTime);
  const isSubmitAllowed = timeToTheNextSubmit === 0;

  return (
    <>
      <Typography.Paragraph>To submit the task answer the questions.</Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text mark strong>
          Note: You must score at least {tresholdPercentage}% of points to pass. You have only {maxAttemptsNumber}{' '}
          attempts. {!strictAttemptsMode && 'After limit attemps is over you can get only half a score.'}
        </Typography.Text>
      </Typography.Paragraph>
      <Typography.Paragraph>
        {oneAttemptPerNumberOfHours ? (
          <Typography.Text mark strong>
            You have only one attempt per {oneAttemptPerNumberOfHours} hour{oneAttemptPerNumberOfHours !== 1 && 's'}.
          </Typography.Text>
        ) : (
          ''
        )}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text strong style={{ fontSize: '2em', color: attemptsLeft > 1 ? '#1890ff' : '#cc0000' }}>
          {getAttemptsLeftMessage(attemptsLeft, strictAttemptsMode)}
          {!isSubmitAllowed &&
            attemptsLeft > 0 &&
            ` Next submit is possible in ${formatMiliseconds(timeToTheNextSubmit)}`}
        </Typography.Text>
      </Typography.Paragraph>
      {questions.map(({ question, answers, multiple, index: questionIndex, questionImage, answersType }) => {
        return (
          <Form.Item
            key={questionIndex}
            label={
              <Row>
                {question}
                {questionImage && (
                  <img
                    src={questionImage}
                    style={{
                      width: '100%',
                      maxWidth: '700px',
                      marginBottom: '10px',
                    }}
                  />
                )}
              </Row>
            }
            name={`answer-${questionIndex}`}
            rules={[{ required: true, message: 'Please answer the question' }]}
          >
            {multiple ? (
              <Checkbox.Group>
                {answers.map((answer, index) => (
                  <Row key={index}>
                    <Checkbox value={index}>
                      {answersType === 'image' ? (
                        <>
                          ({index + 1}){' '}
                          <img
                            src={answer}
                            style={{
                              width: '100%',
                              maxWidth: '400px',
                              marginBottom: '10px',
                            }}
                          />
                        </>
                      ) : (
                        answer
                      )}
                    </Checkbox>
                  </Row>
                ))}
              </Checkbox.Group>
            ) : (
              <Radio.Group>
                {answers.map((answer, index) => (
                  <Row key={index}>
                    <Radio value={index}>
                      {answersType === 'image' ? (
                        <>
                          ({index + 1}){' '}
                          <img
                            src={answer}
                            style={{
                              width: '100%',
                              maxWidth: '400px',
                              marginBottom: '10px',
                            }}
                          />
                        </>
                      ) : (
                        answer
                      )}
                    </Radio>
                  </Row>
                ))}
              </Radio.Group>
            )}
          </Form.Item>
        );
      })}
    </>
  );
}

function renderJsTaskFields(repoUrl: string) {
  return (
    <Row>
      <Typography.Paragraph>
        The system will run tests in the following repository and will update the score based on the result:
      </Typography.Paragraph>
      <Typography.Paragraph>
        <a href={repoUrl} target="_blank">
          {repoUrl}
        </a>
      </Typography.Paragraph>
      <Typography.Paragraph type="warning">
        IMPORTANT: Tests are run using NodeJS 14. Please make sure your solution works in NodeJS 14.
      </Typography.Paragraph>
      {explanationsSubmissionTasks()}
    </Row>
  );
}

function renderKotlinTaskFields(repoUrl: string) {
  return (
    <Row>
      <Typography.Paragraph>
        The system will run tests in the following repository and will update the score based on the result:
      </Typography.Paragraph>
      <Typography.Paragraph>
        <a href={repoUrl} target="_blank">
          {repoUrl}
        </a>
      </Typography.Paragraph>
    </Row>
  );
}

function renderDescription(descriptionUrl: string | null | undefined) {
  if (descriptionUrl == null) {
    return null;
  }
  return (
    <Row>
      <Typography.Paragraph>
        <div>Description:</div>
        <a href={descriptionUrl!} target="_blank">
          {descriptionUrl}
        </a>
      </Typography.Paragraph>
    </Row>
  );
}

function filterAutoTestTasks(tasks: CourseTaskDto[]) {
  return tasks.filter(task => task.checker === 'auto-test' && task.type !== 'test');
}

function getRandomQuestions(questions: SelfEducationQuestion[]) {
  const questionsWithIndex = questions.map((question, index) => ({ ...question, index }));
  return shuffle(questionsWithIndex);
}

function getSubmitData(task: CourseTaskDetailedDto, values: any) {
  let data: object = {};
  switch (task.type) {
    case CourseTaskDetailedDtoTypeEnum.Selfeducation:
      data = Object.entries(values)
        .filter(([key]) => /answer/.test(key))
        .map(([key, value]) => {
          const [, index] = key.match(/answer-(.*)$/) || [];
          return { index: Number(index), value };
        });
      break;
    case CourseTaskDetailedDtoTypeEnum.Codewars:
      if (!values.codewars) {
        message.error('Enter Account');
        return null;
      }

      data = {
        codewars: values.codewars,
        deadline: task.studentEndDate,
      };
      break;

    case CourseTaskDetailedDtoTypeEnum.Jstask:
    case CourseTaskDetailedDtoTypeEnum.Kotlintask:
    case CourseTaskDetailedDtoTypeEnum.Objctask:
      data = {
        githubRepoName: task.githubRepoName,
        sourceGithubRepoUrl: task.sourceGithubRepoUrl,
      };
      break;

    case CourseTaskDetailedDtoTypeEnum.Cvmarkdown:
    case CourseTaskDetailedDtoTypeEnum.Cvhtml:
    case null:
      data = {};
      break;

    default:
      return null;
  }

  return data;
}

function explanationsSubmissionTasks() {
  return (
    <Typography.Paragraph>
      You can submit your solution as many times as you need before the deadline. Without fines. After the deadline, the
      submission will be closed.
    </Typography.Paragraph>
  );
}
