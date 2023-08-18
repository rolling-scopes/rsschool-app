import { PageLayout } from 'components/PageLayout';
import withSession, { Session } from 'components/withSession';
import { useCallback, useEffect, useState } from 'react';
import { GratitudesApi, HeroesRadarDto } from 'api';
import HeroesRadarTable from 'components/Heroes/HeroesRadarTable';
import { Form, Select, Button } from 'antd';
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

export type LayoutType = Parameters<typeof Form>[0]['layout'];

function Page(props: Props) {
  const [loading, setLoading] = useState(false);
  const [heroes, setHeroes] = useState<HeroesRadarDto>({
    content: [],
    pagination: { current: initialPage, pageSize: initialPageSize, itemCount: 0, total: 0, totalPages: 0 },
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number>();
  const [formLayout, setFormLayout] = useState<LayoutType>('inline');
  const [form] = Form.useForm();
  const gratitudeApi = new GratitudesApi();

  const getHeroes = async ({
    current = initialPage,
    pageSize = initialPageSize,
    courseId,
  }: { courseId?: number } & Partial<IPaginationInfo>) => {
    setLoading(true);
    const { data } = await gratitudeApi.getHeroesRadar(current, pageSize, courseId);
    setHeroes(data);
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
      setCourseId(data.courseId);
      await makeRequest(data);
    },
    [heroes],
  );

  const onClear = useCallback(async () => {
    setCourseId(undefined);
    await getHeroes(initialQueryParams);
    form.resetFields();
  }, [heroes]);

  return (
    <PageLayout loading={loading} title="Heroes Radar" githubId={props.session.githubId}>
      <Form layout={formLayout} form={form} onFinish={handleSubmit} style={{ marginBottom: 24 }}>
        <Form.Item name={'courseId'} label="Courses" style={{ minWidth: 260, marginBottom: 16 }}>
          <Select>
            {courses.map(course => (
              <Select.Option key={course.id} value={course.id}>
                {course.name}
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
      <HeroesRadarTable
        heroes={heroes}
        courseId={courseId}
        getHeroes={getHeroes}
        setLoading={setLoading}
        setFormLayout={setFormLayout}
      />
    </PageLayout>
  );
}

export default withSession(Page);
