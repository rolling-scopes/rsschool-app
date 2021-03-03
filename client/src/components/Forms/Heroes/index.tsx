import { Button, Card, Col, Form, Input, Pagination, Row, Select, Tag } from 'antd';
import { GithubAvatar } from '../../GithubAvatar';
import css from 'styled-jsx/css';
import { useCallback, useEffect, useState } from 'react';
import { Course } from '../../../services/models';
import { IGratitudeGetResponse, IGratitudeGetRequest } from '../../../../../common/interfaces/gratitude';
import { GratitudeService } from '../../../services/gratitude';
import { useAsync } from 'react-use';
import { CoursesService } from '../../../services/courses';
import { onlyDefined } from '../../../utils/onlyDefined';
import { HeroesFormData } from './types';

const { Meta } = Card;
const initialPagination = 1;
const initialPageSize = 10;

export const fields = {
  name: 'name',
  githubId: 'githubId',
  courseId: 'courseId',
} as const;

export const HeroesForm = ({ setLoading }: { setLoading: (arg: boolean) => void }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [heroesData, setHeroesData] = useState([] as IGratitudeGetResponse[]);
  const [heroesCount, setHeroesCount] = useState(initialPagination);
  const [currentPagination, setCurrentPagination] = useState(initialPagination);
  const gratitudeService = new GratitudeService();
  const [form] = Form.useForm();

  useEffect(() => {
    const getHeroes = async () => {
      setLoading(true);
      const heroes = await gratitudeService.getGratitude({ current: initialPagination, pageSize: initialPageSize });
      setHeroesData(heroes.content);
      setHeroesCount(heroes.count);
      setLoading(false);
    };
    getHeroes();
  }, []);
  useAsync(async () => {
    const [courses] = await Promise.all([new CoursesService().getCourses()]);
    setCourses(courses);
  }, []);

  const makeRequest = useCallback(
    async (data: IGratitudeGetRequest) => {
      setLoading(true);
      const heroes = await gratitudeService.getGratitude(data);
      setHeroesData(heroes.content);
      setHeroesCount(heroes.count);
      setCurrentPagination(initialPagination);
      setLoading(false);
    },
    [heroesData],
  );

  const handleSubmit = useCallback(
    async (formData: HeroesFormData) => {
      const data = onlyDefined(formData) as Partial<HeroesFormData>;
      setCurrentPagination(initialPagination);
      await makeRequest(data);
    },
    [heroesData],
  );

  const onClear = useCallback(async () => {
    setLoading(true);
    const heroes = await gratitudeService.getGratitude({ current: initialPagination, pageSize: initialPageSize });
    setHeroesData(heroes.content);
    setHeroesCount(heroes.count);
    setCurrentPagination(initialPagination);
    setLoading(false);
    form.resetFields();
  }, [heroesData]);

  const onClickPagination = useCallback(
    async (current: number, pageSize?: number) => {
      const formData = form.getFieldsValue() as HeroesFormData;
      await makeRequest({ current, pageSize: pageSize!, ...formData });
      setCurrentPagination(current);
    },
    [currentPagination],
  );

  return (
    <>
      <Form layout="inline" form={form} onFinish={handleSubmit}>
        <Form.Item name={fields.name} label="Name">
          <Input />
        </Form.Item>
        <Form.Item name={fields.githubId} label="GithubId">
          <Input />
        </Form.Item>
        <Form.Item name={fields.courseId} label="Courses" style={{ minWidth: 300 }}>
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
        {heroesData.map(e => (
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              hoverable
              style={{ margin: '12px 0' }}
              key={e.user_id}
              cover={
                <div className="flex-column" style={{ marginTop: 20 }}>
                  <GithubAvatar githubId={e.githubId} size={96} />
                </div>
              }
            >
              <div className="flex-column">
                <Meta
                  title={<div className="flex-column">{`${e.firstName} ${e.lastName}`}</div>}
                  description={
                    <>
                      <div className="flex-column">{`Gratituded ${e.gratitudeCount} times`}</div>
                      <div className="flex-column">
                        <span className="text-wrap">
                          {`${e.badges.length > 1 ? e.badges.join(', ') : e.badges[0]}`}
                        </span>
                      </div>
                    </>
                  }
                />
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
      <Row style={{ marginTop: 16, marginBottom: 16, justifyContent: 'flex-end' }}>
        <Pagination current={currentPagination} total={heroesCount} onChange={onClickPagination} />
      </Row>
      <style jsx>{styles}</style>
    </>
  );
};

const styles = css`
  .flex-column {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .text-wrap {
    text-align: center;
    text-overflow: ellipsis;
    width: 150px;
    overflow: hidden;
    white-space: nowrap;
  }
`;
