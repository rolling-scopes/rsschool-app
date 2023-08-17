import { PageLayout } from 'components/PageLayout';
import withSession, { Session } from 'components/withSession';
import { useCallback, useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import css from 'styled-jsx/css';
import { GratitudesApi, HeroRadarDto } from 'api';
import HeroesRadarCard from 'components/Heroes/HeroesRadarCard';
import { Form, Select, Button, Pagination, Row } from 'antd';
import { fields } from 'components/Forms/Heroes';
import { useAsync } from 'react-use';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';
import { onlyDefined } from 'utils/onlyDefined';
import { IPaginationInfo } from 'common/types/pagination';

type Props = {
  session: Session;
};

const initialPage = 1;
const initialPageSize = 20;
const initialQueryParams = { current: initialPage, pageSize: initialPageSize };

function Page(props: Props) {
  const [loading, setLoading] = useState(false);
  const [heroes, setHeroes] = useState<HeroRadarDto[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [heroesCount, setHeroesCount] = useState(initialPage);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [form] = Form.useForm();
  const gratitudeApi = new GratitudesApi();

  const getHeroes = async ({current = initialPage, pageSize = initialPageSize, courseId} : {courseId?: number} & Partial<IPaginationInfo>) => {
    setLoading(true);
    const { data } = await gratitudeApi.getHeroesRadar(current, pageSize, courseId);
    setHeroes(data.content);
    setHeroesCount(data.pagination.total);
    setCurrentPage(initialPage);
    setLoading(false);
  };

  useEffect(() => {
    getHeroes(initialQueryParams);
  }, []);

  useAsync(async () => {
    const [courses] = await Promise.all([new CoursesService().getCourses()]);
    setCourses(courses);
  }, []);

  const makeRequest = useCallback(
    async (data: { courseId: number }) => {
      await getHeroes(data);
    },
    [heroes],
  );

  const handleSubmit = useCallback(
    async (formData: { courseId: number }) => {
      const data = onlyDefined(formData) as { courseId: number };
      await makeRequest(data);
    },
    [heroes],
  );

  const onClear = useCallback(async () => {
    await getHeroes(initialQueryParams);
    form.resetFields();
  }, [heroes]);

  const onClickPagination = useCallback(
    async (current: number, pageSize: number = initialPageSize) => {
      const formData = form.getFieldsValue();
      await makeRequest({ current, pageSize, ...formData });
      setCurrentPage(current);
    },
    [currentPage],
  );

  return (
    <PageLayout loading={loading} title="Heroes Radar" githubId={props.session.githubId}>
      <Form layout="inline" form={form} onFinish={handleSubmit} style={{ marginBottom: 24 }}>
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
        {heroes.map(hero => (
          <HeroesRadarCard key={hero.githubId} hero={hero} />
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
    </PageLayout>
  );
}

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

export default withSession(Page);
