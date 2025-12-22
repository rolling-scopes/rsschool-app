import { Avatar, Button, Card, Form, Grid, Input, Pagination, Row, Select, Space, Typography } from 'antd';
import { FormLayout } from 'antd/es/form/Form';
import { useCallback, useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import heroesBadges from 'configs/heroes-badges';
import styles from './index.module.css';
import { GratitudeService, HeroesFormData, IGratitudeGetRequest, IGratitudeGetResponse } from 'services/gratitude';
import { onlyDefined } from 'utils/onlyDefined';
import { getFullName } from 'domain/user';
import { useActiveCourseContext } from 'modules/Course/contexts';

const { Text, Link, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const initialPage = 1;
const initialPageSize = 20;

export const fields = {
  name: 'name',
  githubId: 'githubId',
  courseId: 'courseId',
} as const;

export const HeroesForm = ({ setLoading }: { setLoading: (arg: boolean) => void }) => {
  const { courses } = useActiveCourseContext();

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
        <Form.Item name={fields.githubId} label="GitHub Username" style={{ marginBottom: 16 }}>
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
        className={styles.masonry!}
        columnClassName={styles.masonryColumn!}
      >
        {heroesData.map(feedback => (
          <div
            style={{ marginBottom: gapSize, overflow: 'hidden' }}
            key={`card-${feedback.id}`}
            className={styles.card}
          >
            <Card style={{ position: 'relative', background: 'none' }}>
              <div
                className={styles.badgeBg}
                style={{ backgroundImage: `url(/static/svg/badges/${heroesBadges[feedback.badgeId]?.url})` }}
              />
              <div className={styles.badgeNote} style={{ marginBottom: 48 }}>
                <Paragraph style={{ margin: 0 }}>
                  <Text strong>From:</Text> {getFullName(feedback.from)} (
                  <Link href={`/profile?githubId=${feedback.from.githubId}`}>@{feedback.from.githubId}</Link>)
                </Paragraph>
                <Paragraph style={{ margin: 0 }}>
                  <Text strong>To:</Text> {getFullName(feedback)} (
                  <Link href={`/profile?githubId=${feedback.githubId}`}>@{feedback.githubId}</Link>)
                </Paragraph>
              </div>
              <div className={styles.flexCenter} style={{ marginBottom: 48 }}>
                <div className={styles.badge}>
                  <Avatar
                    src={`/static/svg/badges/${heroesBadges[feedback.badgeId]?.url}`}
                    alt={`${feedback.badgeId} badge`}
                    size={128}
                  />
                </div>
              </div>
              <div className={styles.badgeNote}>
                <Paragraph style={{ margin: 0 }}>{feedback.comment}</Paragraph>
              </div>
            </Card>
          </div>
        ))}
      </Masonry>
      <Row style={{ marginTop: 16, marginBottom: 16, justifyContent: 'flex-end' }}>
        <Pagination
          current={currentPage}
          total={heroesCount}
          onChange={onClickPagination}
          defaultPageSize={initialPageSize}
        />
      </Row>
    </>
  );
};

const gapSize = 16;
