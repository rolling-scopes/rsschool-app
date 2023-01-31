import { DatePicker, Form, Input, InputNumber, message, Select, Typography } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Modal from 'antd/lib/modal/Modal';
import { CreateTeamDistributionDto, TeamDistributionApi, TeamDistributionDto } from 'api';
import { TIMEZONES } from 'configs/timezones';
import dayjs, { Dayjs } from 'dayjs';
import { formatTimezoneToUTC } from 'services/formatter';
import { urlPattern } from 'services/validators';

import 'dayjs/plugin/timezone';

type Props = {
  data?: TeamDistributionDto;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  courseId: number;
};

const { Text } = Typography;

const formLayoutProps = {
  labelCol: { span: 8 },
  wrapperCol: { span: 24 },
};

interface FormState extends TeamDistributionDto {
  timeZone: string;
  range: Dayjs[];
}

const { Option } = Select;

const teamDistributionApi = new TeamDistributionApi();

function getInitialValues(data: TeamDistributionDto) {
  const timeZone = 'UTC';
  return {
    ...data,
    range:
      data.startDate && data.endDate
        ? [
            data.startDate ? dayjs.tz(data.startDate, timeZone) : null,
            data.endDate ? dayjs.tz(data.endDate, timeZone) : null,
          ]
        : null,
    timeZone,
    strictTeamSizeMode: data.strictTeamSizeMode ?? true,
    strictTeamSize: data.strictTeamSize ?? 3,
    minTotalScore: data.minTotalScore ?? 0,
  };
}

const createRecord = (values: FormState): CreateTeamDistributionDto => {
  const [startDate, endDate] = values.range;
  const record = {
    name: values.name!,
    description: values.description ?? '',
    startDate: formatTimezoneToUTC(startDate, values.timeZone),
    endDate: formatTimezoneToUTC(endDate, values.timeZone),
    strictTeamSizeMode: values.strictTeamSizeMode ?? true,
    minTeamSize: values.minTeamSize ?? 2,
    maxTeamSize: values.maxTeamSize ?? 4,
    strictTeamSize: values.strictTeamSize ?? 3,
    minTotalScore: values.minTotalScore ?? 0,
    descriptionUrl: values.descriptionUrl ?? '',
  };
  return record;
};

const submitTeamDistribution = async (courseId: number, values: FormState, id?: number): Promise<void> => {
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
  const [form] = Form.useForm<FormState>();
  const handleModalSubmit = async (values: FormState) => {
    await submitTeamDistribution(courseId, values, data?.id);
    await onSubmit();
  };

  return (
    <Modal
      open={true}
      title={'Team distribution'}
      width={756}
      onOk={async () => {
        const values = await form.validateFields().catch(() => null);
        if (values == null) {
          return;
        }
        handleModalSubmit(values);
      }}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
    >
      <Form {...formLayoutProps} form={form} initialValues={data ? getInitialValues(data) : undefined}>
        <Text strong>
          You are {data ? 'editing' : 'creating'} a group distribution event. Fill out the form to add it to the
          schedule.
        </Text>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter event name' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="timeZone" label="TimeZone" initialValue="UTC">
          <Select placeholder="Please select a timezone">
            {TIMEZONES.map(tz => (
              <Option key={tz} value={tz}>
                {/* there is no 'Europe / Kyiv' time zone at the moment */}
                {tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="range"
          label="Pre-distribution period"
          tooltip="Time frame for student registration and self distribution"
          rules={[{ required: true, type: 'array', message: 'Please enter start and end date' }]}
        >
          <DatePicker.RangePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: [dayjs().hour(0).minute(0), dayjs().hour(23).minute(59)] }}
          />
        </Form.Item>
        <Form.Item
          name="strictTeamSize"
          label="Team size"
          initialValue={3}
          rules={[{ required: true, message: 'Please enter team size' }]}
        >
          <InputNumber min={2} />
        </Form.Item>
        <Form.Item
          initialValue={0}
          name="minTotalScore"
          label="Minimum passing score"
          tooltip="Shows the activity of the students and their maturity to complete group tasks"
        >
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
      </Form>
    </Modal>
  );
}
