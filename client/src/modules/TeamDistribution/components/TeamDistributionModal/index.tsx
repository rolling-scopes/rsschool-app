import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { CreateTeamDistributionDto, TeamDistributionApi, TeamDistributionDto } from 'api';
import { ModalForm } from 'components/Forms';
import { TIMEZONES } from 'configs/timezones';
import moment, { Moment } from 'moment';
import { formatTimezoneToUTC } from 'services/formatter';

type Props = {
  data: Partial<TeamDistributionDto>;
  onCancel: () => void;
  onSubmit: () => void;
  courseId: number;
};

interface FormState extends TeamDistributionDto {
  timeZone: string;
  range: Moment[];
}

const { Option } = Select;

const teamDistributionApi = new TeamDistributionApi();

export function getInitialValues(data: Partial<TeamDistributionDto>) {
  const timeZone = 'UTC';
  return {
    ...data,
    timeZone,
  };
}

const createRecord = (values: Partial<FormState>): CreateTeamDistributionDto => {
  const [startDate, endDate] = values.range!;
  const record = {
    name: values.name!,
    description: values.description ?? '',
    startDate: formatTimezoneToUTC(startDate!, values.timeZone!),
    endDate: formatTimezoneToUTC(endDate!, values.timeZone!),
  };
  return record;
};

const submitTeamDistribution = async (courseId: number, values: Partial<FormState>): Promise<void> => {
  const record = createRecord(values);
  await teamDistributionApi.createTeamDistribution(courseId, record);
};

export function TeamDistributionModal({ data, onCancel, courseId, onSubmit }: Props) {
  const [form] = Form.useForm<Partial<FormState>>();

  const handleModalSubmit = async (values: Partial<FormState>) => {
    await submitTeamDistribution(courseId, values);
    onSubmit();
  };

  return (
    <ModalForm
      form={form}
      data={data}
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
            <Select defaultValue="UTC" placeholder="Please select a timezone">
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
      <Form.Item name="description" label="Description">
        <TextArea />
      </Form.Item>
    </ModalForm>
  );
}
