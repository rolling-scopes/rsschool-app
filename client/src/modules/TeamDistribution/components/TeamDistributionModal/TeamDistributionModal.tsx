import { DatePicker, Form, Input, InputNumber, message, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Modal from 'antd/lib/modal/Modal';
import { CreateTeamDistributionDto, TeamDistributionApi, TeamDistributionDto } from 'api';
import { TIMEZONES } from 'configs/timezones';
import moment, { Moment } from 'moment';
import { formatTimezoneToUTC } from 'services/formatter';
import { urlPattern } from 'services/validators';

type Props = {
  data?: Partial<TeamDistributionDto>;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  courseId: number;
};

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 20 },
};

interface FormState extends TeamDistributionDto {
  timeZone: string;
  range: Moment[];
}

const { Option } = Select;

const teamDistributionApi = new TeamDistributionApi();

function getInitialValues(data?: Partial<TeamDistributionDto>) {
  const timeZone = 'UTC';
  return {
    name: data?.name,
    description: data?.description,
    descriptionUrl: data?.descriptionUrl,
    range:
      data?.startDate && data.endDate
        ? [
            data.startDate ? moment.tz(data.startDate, timeZone) : null,
            data.endDate ? moment.tz(data.endDate, timeZone) : null,
          ]
        : null,
    timeZone,
    strictTeamSizeMode: data?.strictTeamSizeMode ?? true,
    minTeamSize: data?.minTeamSize ?? 2,
    maxTeamSize: data?.maxTeamSize ?? 4,
    strictTeamSize: data?.strictTeamSize ?? 3,
    minTotalScore: data?.minTotalScore ?? 0,
  };
}

const createRecord = (values: Partial<FormState>): CreateTeamDistributionDto => {
  const [startDate, endDate] = values.range!;
  const record = {
    name: values.name!,
    description: values.description ?? '',
    startDate: formatTimezoneToUTC(startDate!, values.timeZone!),
    endDate: formatTimezoneToUTC(endDate!, values.timeZone!),
    strictTeamSizeMode: values.strictTeamSizeMode ?? true,
    minTeamSize: values.minTeamSize ?? 2,
    maxTeamSize: values.maxTeamSize ?? 4,
    strictTeamSize: values.strictTeamSize ?? 3,
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
  const handleModalSubmit = async (values: Partial<FormState>) => {
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
      <Form {...layout} form={form} initialValues={getInitialValues(data)}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter event name' }]}>
          <Input />
        </Form.Item>
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
        <Form.Item
          name="strictTeamSize"
          label="Team size"
          rules={[{ required: true, message: 'Please enter team size' }]}
        >
          <InputNumber min={2} />
        </Form.Item>
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
      </Form>
    </Modal>
  );
}
