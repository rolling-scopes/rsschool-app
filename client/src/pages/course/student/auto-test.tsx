import { Button, Col, Table, Form, Input, message, Row, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { PageLayout, withSession } from 'components';
import { CourseTaskSelect } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { notUrlPattern, udemyCertificateId } from 'services/validators';
import { dateTimeRenderer } from 'components/Table';

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
    const task = courseTasks.find(t => t.courseTaskId === courseTaskId);
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

  const { type, descriptionUrl, githubRepoName } = courseTasks.find(t => t.courseTaskId === courseTaskId) ?? {};
  return (
    <PageLayout loading={loading} title="Auto-Test" courseName={props.course.name} githubId={props.session.githubId}>
      <Row gutter={24}>
        <Col style={{ marginBottom: 32 }} xs={24} sm={18} md={12} lg={10}>
          <Form form={form} className="m-2" onFinish={handleSubmit} layout="vertical">
            <CourseTaskSelect onChange={handleCourseTaskChange} data={courseTasks} />
            {type === 'htmlcssacademy' && (
              <>
                {renderDescription(descriptionUrl)}
                {renderHtmlCssAcademyFields()}
              </>
            )}
            {type === 'codewars' && (
              <>
                {renderDescription(descriptionUrl)}
                <Form.Item
                  name="codewars"
                  label="Codewars Account"
                  rules={[{ pattern: notUrlPattern, message: 'Enter valid Codewars account' }]}
                >
                  <Input style={{ maxWidth: 250 }} placeholder="username" />
                </Form.Item>
              </>
            )}
            {type === 'jstask' && renderJsTaskFields(props.session.githubId, githubRepoName)}
            <Row>
              <Button size="large" type="primary" htmlType="submit">
                Submit
              </Button>
            </Row>
          </Form>
        </Col>
        <Col xs={24} sm={20} md={18} lg={14}>
          {courseTaskId ? (
            <>
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
                    render: dateTimeRenderer,
                  },
                  {
                    title: 'Task Name',
                    dataIndex: ['courseTask', 'task', 'name'],
                    ellipsis: true,
                  },
                  {
                    title: 'Score',
                    dataIndex: 'score',
                  },
                  {
                    title: 'Details',
                    dataIndex: 'details',
                  },
                ]}
                dataSource={verifications}
              />
            </>
          ) : null}
        </Col>
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));

function renderJsTaskFields(githubId: string, githubRepoName: string | undefined) {
  const repoUrl = `https://github.com/${githubId}/${githubRepoName}`;
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
        IMPORTANT: Tests are run using NodeJS 10. Please make sure your solution works in NodeJS 10.
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
      (new Date(task.studentEndDate).getTime() > Date.now() || task.type === 'codewars') &&
      task.verification === 'auto' &&
      (task.type === 'htmlcssacademy' || task.type === 'codewars' || task.type === 'jstask'),
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

    case 'codewars':
      if (!values.codewars) {
        message.error('Enter Account');
        return null;
      }

      data = {
        codewars: values.codewars,
        deadline: task.studentEndDate,
      };
      break;

    case 'jstask':
      data = {
        githubRepoName: task.githubRepoName,
        sourceGithubRepoUrl: task.sourceGithubRepoUrl,
      };
      break;

    default:
      return null;
  }

  return data;
}
