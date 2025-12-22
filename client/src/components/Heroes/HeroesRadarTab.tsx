import { FileExcelOutlined } from '@ant-design/icons';
import { SessionContext, useActiveCourseContext } from '@client/modules/Course/contexts';
import { onlyDefined } from '@client/shared/utils/onlyDefined';
import { IPaginationInfo } from '@client/shared/utils/pagination';
import type { TimeRangePickerProps } from 'antd';
import { Button, Checkbox, DatePicker, Form, Row, Select, Space, TableProps } from 'antd';
import { CountryDto, GratitudesApi, HeroesRadarDto, HeroRadarDto } from '@client/api';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useState } from 'react';
import HeroesRadarTable from './HeroesRadarTable';

export type HeroesRadarFormProps = {
  courseId?: number;
  notActivist?: boolean;
  countryName?: string;
  dates?: (dayjs.Dayjs | null)[];
};

type GetHeroesProps = HeroesRadarFormProps & Partial<IPaginationInfo>;

export type LayoutType = Parameters<typeof Form>[0]['layout'];

const initialPage = 1;
const initialPageSize = 20;
const initialQueryParams = { current: initialPage, pageSize: initialPageSize };

const { RangePicker } = DatePicker;

const currentDayjs = dayjs();
const rangePresets: TimeRangePickerProps['presets'] = [
  { label: 'Last 7 Days', value: [currentDayjs.add(-7, 'd'), currentDayjs] },
  { label: 'Last 14 Days', value: [currentDayjs.add(-14, 'd'), currentDayjs] },
  { label: 'Last 30 Days', value: [currentDayjs.add(-30, 'd'), currentDayjs] },
  { label: 'Last 90 Days', value: [currentDayjs.add(-90, 'd'), currentDayjs] },
];

function HeroesRadarTab({ setLoading }: { setLoading: (arg: boolean) => void }) {
  const { courses } = useActiveCourseContext();

  const [heroes, setHeroes] = useState<HeroesRadarDto>({
    content: [],
    pagination: { current: initialPage, pageSize: initialPageSize, itemCount: 0, total: 0, totalPages: 0 },
  });

  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<HeroesRadarFormProps>(form.getFieldsValue());
  const [formLayout, setFormLayout] = useState<LayoutType>('inline');
  const { isAdmin } = useContext(SessionContext);

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
    if (isAdmin) {
      getCountries();
    }
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

  const exportToCsv = () => {
    const data = onlyDefined(formData);
    const formParams = Object.entries(data).reduce((acc: string[][], [key, value]) => {
      if (key === 'dates' && Array.isArray(value)) {
        const [startDate, endDate] = value.map(date => date?.format('YYYY-MM-DD'));
        return [...acc, ['startDate', `${startDate}`], ['endDate', `${endDate}`]];
      }
      return [...acc, [key, `${value}`]];
    }, []);

    const params = new URLSearchParams([['current', '1'], ['pageSize', `${heroes.pagination.total}`], ...formParams]);
    window.location.href = `/api/v2/gratitudes/heroes/radar/csv?${params}`;
  };

  return (
    <>
      <Row style={{ marginBottom: 24 }} justify="space-between">
        <Form layout={formLayout} form={form} onFinish={handleSubmit}>
          <Form.Item name={'courseId'} label="Courses" style={{ minWidth: 260, marginBottom: 16 }}>
            <Select
              placeholder="Select course"
              showSearch
              optionFilterProp="label"
              options={courses.map(({ id, name }) => ({ value: id, label: name }))}
            />
          </Form.Item>
          {isAdmin && (
            <Form.Item name={'countryName'} label="Countries" style={{ minWidth: 260, marginBottom: 16 }}>
              <Select
                placeholder="Select country"
                showSearch
                options={countries.map(({ countryName }) => ({ value: countryName, label: countryName }))}
              />
            </Form.Item>
          )}
          <Form.Item name={'dates'} label="Dates" style={{ minWidth: 260, marginBottom: 16 }}>
            <RangePicker presets={rangePresets} />
          </Form.Item>
          <Form.Item name={'notActivist'} valuePropName="checked" style={{ marginBottom: 16 }}>
            <Checkbox>Show only not activists</Checkbox>
          </Form.Item>
          <Space align="start" size={20} style={{ marginBottom: 16 }}>
            <Button type="primary" htmlType="submit">
              Filter
            </Button>
            <Button type="primary" onClick={onClear}>
              Clear
            </Button>
          </Space>
        </Form>
        {isAdmin && (
          <Button icon={<FileExcelOutlined />} style={{ marginRight: 8 }} onClick={exportToCsv}>
            Export CSV
          </Button>
        )}
      </Row>
      <HeroesRadarTable heroes={heroes} onChange={handleChange} setFormLayout={setFormLayout} />
    </>
  );
}

export default HeroesRadarTab;
