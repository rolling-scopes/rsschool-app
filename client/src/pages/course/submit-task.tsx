import { Button, Col, Form, Input, message, Row, Typography } from 'antd';
import { PageLayoutSimple, withSession } from 'components';
import { CourseTaskSelect } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { notUrlPattern, udemyCertificateId } from 'services/validators';

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);

  useAsync(async () => {
    const tasks = await courseService.getCourseTasks();

    const courseTasks = tasks.filter(
      task =>
        task.studentEndDate &&
        (new Date(task.studentEndDate).getTime() > Date.now() || task.type === 'codewars') &&
        task.verification === 'auto' &&
        (task.type === 'htmlcssacademy' || task.type === 'codewars' || task.type === 'jstask'),
    );
    setCourseTasks(courseTasks);
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

  const task = courseTasks.find(t => t.courseTaskId === courseTaskId);
  return (
    <PageLayoutSimple
      loading={loading}
      title="Submit Task"
      courseName={props.course.name}
      githubId={props.session.githubId}
    >
      <Form className="m-2" onFinish={handleSubmit} layout="vertical">
        <CourseTaskSelect
          onChange={courseTaskId => {
            setCourseTaskId(courseTaskId);
            form.setFieldsValue({ courseTaskId });
          }}
          data={courseTasks}
        />
        {task && task.type === 'htmlcssacademy' && (
          <>
            {task.descriptionUrl && (
              <Row>
                <Typography.Paragraph>
                  <div>Description:</div>
                  <a href={task.descriptionUrl!} target="_blank">
                    {task.descriptionUrl}
                  </a>
                </Typography.Paragraph>
              </Row>
            )}
            <Row gutter={24}>
              <Col xs={12} sm={8}>
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
          </>
        )}
        {task && task.type === 'codewars' && (
          <>
            {task.descriptionUrl && (
              <Row>
                <Typography.Paragraph>
                  <div>Description:</div>
                  <a href={task.descriptionUrl!} target="_blank">
                    {task.descriptionUrl}
                  </a>
                </Typography.Paragraph>
              </Row>
            )}
            <Row gutter={24}>
              <Col xs={12} sm={8}>
                <Form.Item
                  name="codewars"
                  label="Codewars Account"
                  rules={[{ pattern: notUrlPattern, message: 'Enter valid Codewars account' }]}
                >
                  <Input placeholder="username" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
        {task && task.type === 'jstask' && (
          <Row>
            <Typography.Paragraph>
              The system will run tests in the following repository and will update the score based on the result
            </Typography.Paragraph>
            <Typography.Paragraph type="danger">
              IMPORTANT: Tests are run using NodeJS 10. Please make sure your solution works in NodeJS 10.
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text mark>
                https://github.com/{props.session.githubId}/{task.githubRepoName}
              </Typography.Text>
            </Typography.Paragraph>
          </Row>
        )}
        <Row>
          <Button size="large" type="primary" htmlType="submit">
            Submit
          </Button>
        </Row>
      </Form>
    </PageLayoutSimple>
  );
}

export default withCourseData(withSession(Page));

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
