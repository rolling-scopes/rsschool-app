import { Avatar, Button, Card, Form, Grid, Input, Pagination, Row, Select, Space, Typography } from 'antd';
import { FormLayout } from 'antd/es/form/Form';
import { useCallback, useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import css from 'styled-jsx/css';
import { IGratitudeGetRequest, IGratitudeGetResponse, HeroesFormData } from 'common/interfaces/gratitude';
import heroesBadges from 'configs/heroes-badges';
import { GratitudeService } from 'services/gratitude';
import { onlyDefined } from 'utils/onlyDefined';
import { Course } from 'services/models';
import { getFullName } from 'domain/user';

const { Text, Link, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const initialPage = 1;
const initialPageSize = 20;

export const fields = {
  name: 'name',
  githubId: 'githubId',
  courseId: 'courseId',
} as const;

export const HeroesForm = ({ setLoading, courses }: { setLoading: (arg: boolean) => void; courses: Course[] }) => {
  const [heroesData, setHeroesData] = useState<IGratitudeGetResponse[]>([]);
  const [heroesCount, setHeroesCount] = useState(initialPage);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const gratitudeService = new GratitudeService();
  const [form] = Form.useForm();
  const { xs } = useBreakpoint();
  const formLayout: FormLayout = xs ? 'vertical' : 'inline';
  const minWidth = xs ? undefined : 300;

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
      <Form layout={formLayout} form={form} onFinish={handleSubmit} style={{ marginBottom: 24 }}>
        <Form.Item name={fields.name} label="Name" style={{ marginBottom: 16 }}>
          <Input />
        </Form.Item>
        <Form.Item name={fields.githubId} label="Github Username" style={{ marginBottom: 16 }}>
          <Input />
        </Form.Item>
        <Form.Item name={fields.courseId} label="Courses" style={{ minWidth, marginBottom: 16 }}>
          <Select options={courses.map(({ id, name }) => ({ value: id, label: name }))} />
        </Form.Item>
        <Space align="start" size={20}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button type="primary" onClick={onClear}>
            Clear
          </Button>
        </Space>
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
                style={{ backgroundImage: `url(/static/svg/badges/${heroesBadges[feedback.badgeId].url})` }}
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
                    src={`/static/svg/badges/${heroesBadges[feedback.badgeId].url}`}
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
