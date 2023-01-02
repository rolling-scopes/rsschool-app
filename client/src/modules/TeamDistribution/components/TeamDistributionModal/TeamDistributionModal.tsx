import { Col, DatePicker, Form, Input, InputNumber, message, Row, Select, Space, Switch } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { CreateTeamDistributionDto, TeamDistributionApi, TeamDistributionDto } from 'api';
import { ModalForm } from 'components/Forms';
import { TIMEZONES } from 'configs/timezones';
import moment, { Moment } from 'moment';
import { useState } from 'react';
import { formatTimezoneToUTC } from 'services/formatter';
import { urlPattern } from 'services/validators';

type Props = {
  data: Partial<TeamDistributionDto>;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  courseId: number;
};

interface FormState extends TeamDistributionDto {
  timeZone: string;
  range: Moment[];
}

const { Option } = Select;

const teamDistributionApi = new TeamDistributionApi();

function getInitialValues(data: Partial<TeamDistributionDto>) {
  const timeZone = 'UTC';
  return {
    ...data,
    range:
      data.startDate && data.endDate
        ? [
            data.startDate ? moment.tz(data.startDate, timeZone) : null,
            data.endDate ? moment.tz(data.endDate, timeZone) : null,
          ]
        : null,
    timeZone,
    strictStudentsCount: data.strictStudentsCount ?? true,
    minStudents: data.minStudents ?? 2,
    maxStudents: data.maxStudents ?? 4,
    studentsCount: data.studentsCount ?? 3,
    minTotalScore: data.minTotalScore ?? 0,
  };
}

const createRecord = (values: Partial<FormState>): CreateTeamDistributionDto => {
  const [startDate, endDate] = values.range!;
  const record = {
    name: values.name!,
    description: values.description ?? '',
    startDate: formatTimezoneToUTC(startDate!, values.timeZone!),
    endDate: formatTimezoneToUTC(endDate!, values.timeZone!),
    strictStudentsCount: values.strictStudentsCount!,
    minStudents: values.minStudents ?? 2,
    maxStudents: values.maxStudents ?? 4,
    studentsCount: values.studentsCount ?? 3,
    minTotalScore: values.minTotalScore ?? 0,
    descriptionUrl: values.descriptionUrl ?? '',
  };
  return record;
};

const submitTeamDistribution = async (courseId: number, values: Partial<FormState>, id?: number): Promise<void> => {
  try {
    const record = createRecord(values);
    if (id) {
      await teamDistributionApi.updateTeamDistribution(courseId, id, record);
    } else {
      await teamDistributionApi.createTeamDistribution(courseId, record);
    }
  } catch (error) {
    message.error('Failed to create team distribution. Please try later.');
  }
};

export default function TeamDistributionModal({ data, onCancel, courseId, onSubmit }: Props) {
  const [form] = Form.useForm<Partial<FormState>>();
  const [changes, setChanges] = useState<Record<string, boolean>>({
    strictStudentsCount: data.strictStudentsCount ?? true,
  });

  const handleModalSubmit = async (values: Partial<FormState>) => {
    await submitTeamDistribution(courseId, values, data.id);
    await onSubmit();
  };

  return (
    <ModalForm
      form={form}
      data={data}
      onChange={values => setChanges({ strictStudentsCount: values.strictStudentsCount })}
      title="Team Distribution"
      submit={handleModalSubmit}
      cancel={onCancel}
      getInitialValues={getInitialValues}
    >
      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter event name' }]}>
        <Input />
      </Form.Item>
      <Row gutter={24}>
        <Col span={18}>
          <Form.Item
            name="range"
            label="Start Date - End Date"
            rules={[{ required: true, type: 'array', message: 'Please enter start and end date' }]}
          >
            <DatePicker.RangePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm', defaultValue: [moment().hour(0).minute(0), moment().hour(23).minute(59)] }}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="timeZone" label="TimeZone">
            <Select placeholder="Please select a timezone">
              {TIMEZONES.map(tz => (
                <Option key={tz} value={tz}>
                  {/* there is no 'Europe / Kyiv' time zone at the moment */}
                  {tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="strictStudentsCount" label="Fixed team size" valuePropName="checked">
        <Switch />
      </Form.Item>
      {changes.strictStudentsCount === true ? (
        <Form.Item
          name="studentsCount"
          label="Team size"
          rules={[{ required: true, message: 'Please enter team size' }]}
        >
          <InputNumber min={2} />
        </Form.Item>
      ) : (
        <Space>
          <Form.Item
            name="minStudents"
            label="Minimum Team size"
            rules={[{ required: true, message: 'Please enter minimum team size' }]}
          >
            <InputNumber min={2} />
          </Form.Item>
          <Form.Item
            name="maxStudents"
            label="Maximum Team size"
            rules={[{ required: true, message: 'Please enter maximum team size' }]}
          >
            <InputNumber min={2} />
          </Form.Item>
        </Space>
      )}
      <Form.Item name="minTotalScore" label="Minimum passing score">
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea />
      </Form.Item>
      <Form.Item
        name="descriptionUrl"
        label="Description Url"
        rules={[{ message: 'Please enter valid URL', pattern: urlPattern }]}
      >
        <Input />
      </Form.Item>
    </ModalForm>
  );
}
