import { Button, Card, Col, Form, Input, Row, Select, Tag } from 'antd';
import { GithubAvatar, PageLayout } from 'components';
import withSession, { Session } from 'components/withSession';
import css from 'styled-jsx/css';
import { GratitudeService } from '../services/gratitude';
import { useCallback, useEffect, useState } from 'react';
import { IGratitudeGet, IGratitudeGetRequest } from '../../../common/interfaces/gratitude';
import { onlyDefined } from '../utils/onlyDefined';
import { useAsync } from 'react-use';
import { CoursesService } from '../services/courses';
import { Course } from '../services/models';

const { Meta } = Card;

type Props = {
  session: Session;
};

function Page(props: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [heroes, setHeroes] = useState([] as IGratitudeGet[]);
  const [loading, setLoading] = useState(false);
  const gratitudeService = new GratitudeService();
  const [form] = Form.useForm();

  useEffect(() => {
    const getHeroes = async () => {
      setLoading(true);
      setHeroes(await gratitudeService.getGratitude());
      setLoading(false);
    };
    getHeroes();
  }, []);
  useAsync(async () => {
    const [courses] = await Promise.all([new CoursesService().getCourses()]);
    setCourses(courses);
  }, []);
  const handleSubmit = useCallback(
    async formData => {
      const data = onlyDefined(formData) as IGratitudeGetRequest;
      setLoading(true);
      setHeroes(await gratitudeService.getGratitude(data));
      setLoading(false);
    },
    [heroes],
  );

  const onClear = useCallback(async () => {
    setLoading(true);
    setHeroes(await gratitudeService.getGratitude());
    setLoading(false);
    form.resetFields();
  }, [heroes]);

  return (
    <PageLayout loading={loading} title="Heroes" githubId={props.session.githubId}>
      <Form layout="inline" form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="Name">
          <Input />
        </Form.Item>
        <Form.Item name="githubId" label="GithubId">
          <Input />
        </Form.Item>
        <Form.Item name="courseId" label="Courses" style={{ minWidth: 300 }}>
          <Select>
            {courses.map(task => (
              <Select.Option key={task.id} value={task.id}>
                {task.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Button size="middle" type="primary" htmlType="submit">
          Submit
        </Button>
        <Button size="middle" type="primary" onClick={onClear} style={{ marginLeft: 20 }}>
          Clear
        </Button>
      </Form>
      <Row gutter={24}>
        {heroes.map(e => (
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              hoverable
              style={{ margin: '10 0' }}
              key={e.user_id}
              cover={
                <div className="flex-column" style={{ marginTop: 20 }}>
                  <GithubAvatar githubId={e.githubId} size={96} />
                </div>
              }
            >
              <div className="flex-column">
                <Meta title={`${e.firstName} ${e.lastName}`} description={`Gratituded ${e.badges} times`} />
                {e.activist && (
                  <Tag style={{ margin: 10 }} color="gold">
                    Activist
                  </Tag>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <style jsx>{styles}</style>
    </PageLayout>
  );
}

const styles = css`
  .flex-column {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
`;

export default withSession(Page);
