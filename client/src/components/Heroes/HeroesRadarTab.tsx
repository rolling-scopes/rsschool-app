import { Button, Checkbox, Form, Select, Space, TableProps } from 'antd';
import HeroesRadarTable from './HeroesRadarTable';
import { HeroesRadarDto, GratitudesApi, HeroRadarDto } from 'api';
import { IPaginationInfo } from 'common/types/pagination';
import { useState, useEffect, useCallback } from 'react';
import { Course } from 'services/models';
import { onlyDefined } from 'utils/onlyDefined';

export type HeroesRadarFormProps = {
  courseId?: number;
  notActivist?: boolean;
};

type GetHeroesProps = HeroesRadarFormProps & Partial<IPaginationInfo>;

export type LayoutType = Parameters<typeof Form>[0]['layout'];

const initialPage = 1;
const initialPageSize = 20;
const initialQueryParams = { current: initialPage, pageSize: initialPageSize };

function HeroesRadarTab({ setLoading, courses }: { setLoading: (arg: boolean) => void; courses: Course[] }) {
  const [heroes, setHeroes] = useState<HeroesRadarDto>({
    content: [],
    pagination: { current: initialPage, pageSize: initialPageSize, itemCount: 0, total: 0, totalPages: 0 },
  });
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<HeroesRadarFormProps>(form.getFieldsValue());
  const [formLayout, setFormLayout] = useState<LayoutType>('inline');
  const gratitudeApi = new GratitudesApi();

  const getHeroes = async ({
    current = initialPage,
    pageSize = initialPageSize,
    courseId,
    notActivist,
  }: GetHeroesProps) => {
    try {
      setLoading(true);
      const { data } = await gratitudeApi.getHeroesRadar(current, pageSize, courseId, notActivist);
      setHeroes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHeroes(initialQueryParams);
  }, []);

  const makeRequest = useCallback(async (data: HeroesRadarFormProps) => {
    await getHeroes(data);
  }, []);

  const handleSubmit = useCallback(async (formData: HeroesRadarFormProps) => {
    const data = onlyDefined(formData);
    setFormData(data);
    await makeRequest(data);
  }, []);

  const onClear = useCallback(async () => {
    form.resetFields();
    setFormData(form.getFieldsValue());
    await getHeroes(initialQueryParams);
  }, []);

  const handleChange: TableProps<HeroRadarDto>['onChange'] = async ({ current, pageSize }) => {
    try {
      setLoading(true);
      await getHeroes({ current, pageSize, ...formData });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
        <Form.Item name={'notActivist'} valuePropName="checked" style={{ marginBottom: 16 }}>
          <Checkbox>Show only not activists</Checkbox>
        </Form.Item>
        <Space align="start">
          <Button size="middle" type="primary" htmlType="submit">
            Filter
          </Button>
          <Button size="middle" type="primary" onClick={onClear} style={{ marginLeft: 20 }}>
            Clear
          </Button>
        </Space>
      </Form>
      <HeroesRadarTable heroes={heroes} onChange={handleChange} setFormLayout={setFormLayout} />
    </>
  );
}

export default HeroesRadarTab;
