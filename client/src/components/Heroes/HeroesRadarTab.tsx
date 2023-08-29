import { Button, Checkbox, DatePicker, Form, Select, Space, TableProps } from 'antd';
import HeroesRadarTable from './HeroesRadarTable';
import { HeroesRadarDto, GratitudesApi, HeroRadarDto, CountryDto } from 'api';
import { IPaginationInfo } from 'common/types/pagination';
import { useState, useEffect, useCallback } from 'react';
import { Course } from 'services/models';
import { onlyDefined } from 'utils/onlyDefined';
import dayjs from 'dayjs';
import type { TimeRangePickerProps } from 'antd';
import type { Dayjs } from 'dayjs';

export type HeroesRadarFormProps = {
  courseId?: number;
  notActivist?: boolean;
  countryName?: string;
  dates?: (Dayjs | null)[];
};

type GetHeroesProps = HeroesRadarFormProps & Partial<IPaginationInfo>;

export type LayoutType = Parameters<typeof Form>[0]['layout'];

const initialPage = 1;
const initialPageSize = 20;
const initialQueryParams = { current: initialPage, pageSize: initialPageSize };

const { RangePicker } = DatePicker;

const rangePresets: TimeRangePickerProps['presets'] = [
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
];

function HeroesRadarTab({ setLoading, courses }: { setLoading: (arg: boolean) => void; courses: Course[] }) {
  const [heroes, setHeroes] = useState<HeroesRadarDto>({
    content: [],
    pagination: { current: initialPage, pageSize: initialPageSize, itemCount: 0, total: 0, totalPages: 0 },
  });
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<HeroesRadarFormProps>(form.getFieldsValue());
  const [formLayout, setFormLayout] = useState<LayoutType>('inline');
  const gratitudeApi = new GratitudesApi();

  const getCountries = async () => {
    const { data } = await gratitudeApi.getHeroesCountries();
    setCountries(data);
  };

  const getHeroes = async ({
    current = initialPage,
    pageSize = initialPageSize,
    courseId,
    notActivist,
    countryName,
    dates,
  }: GetHeroesProps) => {
    try {
      setLoading(true);
      const [startDate, endDate] = dates?.map(date => date?.format('YYYY-MM-DD')) ?? [];
      const { data } = await gratitudeApi.getHeroesRadar(
        current,
        pageSize,
        courseId,
        notActivist,
        countryName,
        startDate,
        endDate,
      );
      setHeroes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHeroes(initialQueryParams);
    getCountries();
  }, []);

  const handleSubmit = useCallback(async (formData: HeroesRadarFormProps) => {
    const data = onlyDefined(formData);
    setFormData(data);
    await getHeroes(data);
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
          <Select options={courses.map(({ id, name }) => ({ value: id, label: name }))} />
        </Form.Item>
        <Form.Item name={'countryName'} label="Countries" style={{ minWidth: 260, marginBottom: 16 }}>
          <Select>
            {countries.map(({ countryName }) => (
              <Select.Option key={countryName} value={countryName}>
                {countryName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name={'dates'} label="Dates" style={{ minWidth: 260, marginBottom: 16 }}>
          <RangePicker presets={rangePresets} />
        </Form.Item>
        <Form.Item name={'notActivist'} valuePropName="checked" style={{ marginBottom: 16 }}>
          <Checkbox>Show only not activists</Checkbox>
        </Form.Item>
        <Space align="start" size={20}>
          <Button size="middle" type="primary" htmlType="submit">
            Filter
          </Button>
          <Button size="middle" type="primary" onClick={onClear}>
            Clear
          </Button>
        </Space>
      </Form>
      <HeroesRadarTable heroes={heroes} onChange={handleChange} setFormLayout={setFormLayout} />
    </>
  );
}

export default HeroesRadarTab;
