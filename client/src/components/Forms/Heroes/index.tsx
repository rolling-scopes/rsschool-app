import { Button, Card, Form, Input, Pagination, Row, Select, Typography, Avatar } from 'antd';
import { css } from 'styled-jsx/css';
import { useCallback, useEffect, useState } from 'react';
import { Course } from '../../../services/models';
import { IGratitudeGetResponse, IGratitudeGetRequest } from '../../../../../common/interfaces/gratitude';
import { GratitudeService } from '../../../services/gratitude';
import { useAsync } from 'react-use';
import { CoursesService } from '../../../services/courses';
import { onlyDefined } from '../../../utils/onlyDefined';
import { HeroesFormData } from './types';
import heroesBadges from '../../../configs/heroes-badges';
import Masonry from 'react-masonry-css';

const { Text, Link, Paragraph } = Typography;

const initialPage = 1;
const initialPageSize = 20;

export const fields = {
  name: 'name',
  githubId: 'githubId',
  courseId: 'courseId',
} as const;

const getFullName = (user: { firstName: string | null; lastName: string | null; githubId: string }) =>
  user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : `${user.githubId}`;

export const HeroesForm = ({ setLoading }: { setLoading: (arg: boolean) => void }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [heroesData, setHeroesData] = useState([] as IGratitudeGetResponse[]);
  const [heroesCount, setHeroesCount] = useState(initialPage);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const gratitudeService = new GratitudeService();
  const [form] = Form.useForm();

  useEffect(() => {
    const getHeroes = async () => {
      setLoading(true);
      const heroes = await gratitudeService.getGratitude({ current: initialPage, pageSize: initialPageSize });
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
      setCurrentPage(initialPage);
      setLoading(false);
    },
    [heroesData],
  );

  const handleSubmit = useCallback(
    async (formData: HeroesFormData) => {
      const data = onlyDefined(formData) as Partial<HeroesFormData>;
      setCurrentPage(initialPage);
      await makeRequest(data);
    },
    [heroesData],
  );

  const onClear = useCallback(async () => {
    setLoading(true);
    const heroes = await gratitudeService.getGratitude({ current: initialPage, pageSize: initialPageSize });
    setHeroesData(heroes.content);
    setHeroesCount(heroes.count);
    setCurrentPage(initialPage);
    setLoading(false);
    form.resetFields();
  }, [heroesData]);

  const onClickPagination = useCallback(
    async (current: number, pageSize?: number) => {
      const formData = form.getFieldsValue() as HeroesFormData;
      await makeRequest({ current, pageSize: pageSize!, ...formData });
      setCurrentPage(current);
    },
    [currentPage],
  );

  return (
    <>
      <Form layout="inline" form={form} onFinish={handleSubmit} style={{ marginBottom: 24 }}>
        <Form.Item name={fields.name} label="Name" style={{ marginBottom: 16 }}>
          <Input />
        </Form.Item>
        <Form.Item name={fields.githubId} label="GithubId" style={{ marginBottom: 16 }}>
          <Input />
        </Form.Item>
        <Form.Item name={fields.courseId} label="Courses" style={{ minWidth: 300, marginBottom: 16 }}>
          <Select>
            {courses.map(task => (
              <Select.Option key={task.id} value={task.id}>
                {task.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <div>
          <Button size="middle" type="primary" htmlType="submit">
            Submit
          </Button>
          <Button size="middle" type="primary" onClick={onClear} style={{ marginLeft: 20 }}>
            Clear
          </Button>
        </div>
      </Form>
      <Masonry
        breakpointCols={{
          default: 4,
          1100: 3,
          700: 2,
          500: 1,
        }}
        className={masonryClassName}
        columnClassName={masonryColumnClassName}
      >
        {heroesData.map(feedback => (
          <div style={{ marginBottom: gapSize, overflow: 'hidden' }} key={`card-${feedback.id}`} className="card">
            <Card style={{ position: 'relative', background: 'none' }}>
              <div
                className="badge-bg"
                style={{ backgroundImage: `url(/static/svg/badges/${(heroesBadges as any)[feedback.badgeId].url})` }}
              />
              <div className="badge-note" style={{ marginBottom: 48 }}>
                <Paragraph style={{ margin: 0 }}>
                  <Text strong>From:</Text> {getFullName(feedback.from)} (
                  <Link href={`/profile?githubId=${feedback.from.githubId}`}>@{feedback.from.githubId}</Link>)
                </Paragraph>
                <Paragraph style={{ margin: 0 }}>
                  <Text strong>To:</Text> {getFullName(feedback)} (
                  <Link href={`/profile?githubId=${feedback.githubId}`}>@{feedback.githubId}</Link>)
                </Paragraph>
              </div>
              <div className="flex-center" style={{ marginBottom: 48 }}>
                <div className="badge">
                  <Avatar
                    src={`/static/svg/badges/${(heroesBadges as any)[feedback.badgeId].url}`}
                    alt={`${feedback.badgeId} badge`}
                    size={128}
                  />
                </div>
              </div>
              <div className="badge-note">
                <Paragraph style={{ margin: 0 }}>{feedback.comment}</Paragraph>
              </div>
            </Card>
          </div>
        ))}
      </Masonry>
      {masonryStyles}
      {masonryColumnStyles}
      <Row style={{ marginTop: 16, marginBottom: 16, justifyContent: 'flex-end' }}>
        <Pagination
          current={currentPage}
          total={heroesCount}
          onChange={onClickPagination}
          defaultPageSize={initialPageSize}
        />
      </Row>
      <style jsx>{styles}</style>
    </>
  );
};

const gapSize = 16;
const { className: masonryClassName, styles: masonryStyles } = css.resolve`
  div {
    display: flex;
    margin-left: -${gapSize}px;
    width: auto;
  }
`;
const { className: masonryColumnClassName, styles: masonryColumnStyles } = css.resolve`
  div {
    padding-left: ${gapSize}px;
    background-clip: padding-box;
  }
`;

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
  .flex-center {
    display: flex;
    justify-content: center;
  }
  .badge-bg {
    position: absolute;
    background-position: center;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: -1;
    opacity: 0.1;
    transform: scale(1.2);
  }
  .badge-note {
    padding: 16px;
    background: rgba(255, 255, 255, 0.7);
    border: 2px rgba(24, 144, 255, 0.5) dashed;
  }
  .card:hover .badge {
    transform: scale(6.2);
    transition: all 1s ease;
    opacity: 0;
    z-index: -1;
  }
  .card:hover .badge-bg {
    transition: all 2s ease;
    opacity: 0.8;
  }
  .card:hover .badge-note {
    transition: all 1s ease;
    background: rgba(255, 255, 255, 1);
    border: 2px rgba(24, 144, 255, 1) dashed;
  }
`;
