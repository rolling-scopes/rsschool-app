import { Button, Col, Table, Form, Input, message, Row, Typography, notification } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { PageLayout, withSession } from 'components';
import { CourseTaskSelect } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { notUrlPattern, udemyCertificateId } from 'services/validators';
import { shortDateTimeRenderer } from 'components/Table';
import { AxiosError } from 'axios';

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [verifications, setVerifications] = useState([] as any[]);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);

  useAsync(async () => {
    try {
      setLoading(true);
      loadVerifications();
      const tasks = await courseService.getCourseTasks();
      const courseTasks = filterAutoTestTasks(tasks);
      setCourseTasks(courseTasks);
    } catch {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (values: any) => {
    const { courseTaskId } = values;
    const task = courseTasks.find(t => t.id === courseTaskId);
    if (!task) {
      return;
    }
    try {
      const data = getSubmitData(task, values);
      if (data == null) {
        return;
      }

      setLoading(true);
      await courseService.postTaskVerification(courseTaskId, data);
      message.success('The task has been submitted for verification and it will be checked soon.');
      form.resetFields();
    } catch (e) {
      const error = e as AxiosError;
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
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
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
    setCourseTaskId(courseTaskId);
    form.setFieldsValue({ courseTaskId });
    loadVerifications();
  };

  const courseTask = courseTasks.find(t => t.id === courseTaskId);
  return (
    <PageLayout loading={loading} title="Auto-Test" courseName={props.course.name} githubId={props.session.githubId}>
      <Row gutter={24}>
        <Col style={{ marginBottom: 32 }} xs={24} sm={18} md={12} lg={10}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <CourseTaskSelect onChange={handleCourseTaskChange} data={courseTasks} />
            {renderTaskFields(props.session.githubId, courseTask)}
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
              },
              {
                title: 'Status',
                dataIndex: 'status',
              },
              {
                title: 'Task Name',
                dataIndex: ['courseTask', 'task', 'name'],
                ellipsis: true,
              },
              {
                title: 'Score',
                dataIndex: 'score',
                width: 60,
              },
              {
                title: 'Details',
                dataIndex: 'details',
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

function renderTaskFields(githubId: string, courseTask?: CourseTask) {
  const repoUrl = `https://github.com/${githubId}/${courseTask?.githubRepoName}`;
  switch (courseTask?.type) {
    case 'jstask':
      return renderJsTaskFields(repoUrl);
    case 'kotlintask':
    case 'objctask':
      return renderKotlinTaskFields(repoUrl);
    case 'htmlcssacademy':
      return (
        <>
          {renderDescription(courseTask?.descriptionUrl)}
          {renderHtmlCssAcademyFields()}
        </>
      );
    case 'codewars:stage1':
    case 'codewars:stage2': {
      return (
        <>
          {renderDescription(courseTask.descriptionUrl)}
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
        IMPORTANT: Tests are run using NodeJS 12. Please make sure your solution works in NodeJS 12.
      </Typography.Paragraph>
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

function renderHtmlCssAcademyFields() {
  return (
    <Row gutter={24}>
      <Col xs={12} sm={10}>
        <Form.Item
          name="codecademy"
          label="Codecademy Account"
          rules={[{ pattern: notUrlPattern, message: 'Enter valid Codecademy account' }]}
        >
          <Input placeholder="username" />
        </Form.Item>
        <Form.Item
          name="htmlacademy"
          label="Html Academy Account"
          rules={[{ pattern: notUrlPattern, message: 'Enter valid HTML Academy account' }]}
        >
          <Input placeholder="id1234567" />
        </Form.Item>
      </Col>
      <Col xs={12} sm={8} key="2">
        <Form.Item
          name="udemy1"
          label="Udemy: Certificate Id 1"
          rules={[{ pattern: udemyCertificateId, message: 'Enter valid Udemy Certificate Id (UC-XXXX)' }]}
        >
          <Input placeholder="UC-xxxxxx" />
        </Form.Item>
        <Form.Item
          name="udemy2"
          label="Udemy: Certificate Id 2"
          rules={[{ pattern: udemyCertificateId, message: 'Enter valid Udemy Certificate Id (UC-XXXX)' }]}
        >
          <Input placeholder="UC-xxxxxx" />
        </Form.Item>
      </Col>
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

function filterAutoTestTasks(tasks: CourseTask[]) {
  return tasks.filter(
    task =>
      task.studentEndDate &&
      (new Date(task.studentEndDate).getTime() > Date.now() ||
        task.type === 'codewars:stage1' ||
        task.type === 'codewars:stage2') &&
      (task.verification === 'auto' || task.checker === 'auto-test') &&
      task.checker !== 'taskOwner' &&
      task.type !== 'test',
  );
}

function getSubmitData(task: CourseTask, values: any) {
  let data: object = {};
  switch (task.type) {
    case 'htmlcssacademy':
      if (!values.codecademy && !values.htmlacademy && !values.udemy1 && !values.udemy2) {
        message.error('Enter any Account / Cerficate Id');
        return null;
      }

      data = {
        codecademy: values.codecademy,
        htmlacademy: values.htmlacademy,
        udemy: [values.udemy1, values.udemy2].filter(it => !!it),
      };
      break;

    case 'codewars:stage1':
    case 'codewars:stage2':
      if (!values.codewars) {
        message.error('Enter Account');
        return null;
      }

      data = {
        codewars: values.codewars,
        deadline: task.studentEndDate,
        variant: task.type.split(':')[1],
      };
      break;

    case 'jstask':
    case 'kotlintask':
    case 'objctask':
      data = {
        githubRepoName: task.githubRepoName,
        sourceGithubRepoUrl: task.sourceGithubRepoUrl,
      };
      break;

    case 'cv:markdown':
    case 'cv:html':
    case null:
      data = {};
      break;

    default:
      return null;
  }

  return data;
}
