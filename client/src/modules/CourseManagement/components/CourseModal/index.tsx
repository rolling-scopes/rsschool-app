import useRequest from 'ahooks/lib/useRequest';
import { Checkbox, Col, DatePicker, Flex, Form, Input, InputNumber, Modal, Radio, Row, Select, Spin } from 'antd';
import { CoursesApi, CreateCourseDto, DisciplineDto, IdNameDto, UpdateCourseDto } from 'api';
import { DEFAULT_COURSE_ICONS } from 'configs/course-icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Course } from 'services/models';
dayjs.extend(utc);

const wearecommunityRegex = new RegExp('^(https?://)?(www\\.)?wearecommunity\\.io.*$');

const courseApi = new CoursesApi();
const courseIcons = Object.entries(DEFAULT_COURSE_ICONS).map(([key, config]) => ({ ...config, id: key }));

type CourseModalProps = {
  onClose: () => void;
  discordServers: IdNameDto[];
  disciplines: DisciplineDto[];
  courses: Course[];
  courseId: number | null;
};

type FormData = {
  state: 'active' | 'planned' | 'completed';
  range: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  minStudentsPerMentor: number;
  certificateThreshold: number;
  inviteOnly: boolean;
  registrationEndDate: dayjs.Dayjs | null;

  name?: string;
  fullName?: string;
  alias?: string;
  description?: string;
  descriptionUrl?: string;
  customDescriptionUrl?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  locationName?: string;
  discordServerId?: number;
  completed?: boolean;
  primarySkillId?: string;

  logo?: string;
  usePrivateRepositories?: boolean;
  personalMentoring?: boolean;
  personalMentoringStartDate?: string | null;
  personalMentoringEndDate?: string | null;
  personalMentoringDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  certificateIssuer?: string;
  discipline?: { id: number } | null;
  courseId?: number;
  wearecommunityUrl?: string;
  certificateDisciplines?: number[];
};

export function CourseModal(props: CourseModalProps) {
  const [form] = Form.useForm();

  const response = useRequest(
    async () => {
      if (props.courseId == null) {
        return getInitialValues({});
      }
      const response = await courseApi.getCourse(props.courseId);
      return getInitialValues(response.data);
    },
    { refreshDeps: [props.courseId] },
  );

  const updateResponse = useRequest(
    async (formData: FormData) => {
      const record = createRecord(formData);
      if (props.courseId) {
        await courseApi.updateCourse(props.courseId, record);
      } else {
        if (formData.courseId) {
          await courseApi.copyCourse(formData.courseId, record as CreateCourseDto);
        } else {
          await courseApi.createCourse(record as CreateCourseDto);
        }
      }
      props.onClose();
    },
    { manual: true },
  );

  const descriptionUrl = Form.useWatch('descriptionUrl', form);

  const certificateOptions = [
    { value: 0, label: 'any' },
    ...props.disciplines.map(({ id, name }) => ({
      value: id,
      label: name,
    })),
  ];

  const handleCertificateChange = (selectedValues: number[]) => {
    if (selectedValues.includes(0)) {
      form.setFieldsValue({ certificateDisciplines: [0] });
    } else {
      form.setFieldsValue({
        certificateDisciplines: selectedValues.filter(value => value !== 0),
      });
    }
  };

  return (
    <Modal
      style={{ top: 20 }}
      width={800}
      open={true}
      title={props.courseId ? 'Edit Course' : 'Add Course'}
      okText="Save"
      onOk={async e => {
        e.preventDefault();
        const values = await form.validateFields().catch(() => null);
        if (values == null) {
          return;
        }
        form.submit();
      }}
      okButtonProps={{ disabled: response.loading }}
      cancelButtonProps={{ disabled: response.loading }}
      onCancel={props.onClose}
    >
      {response.loading ? (
        <Row justify="center">
          <Col>
            <Spin spinning={true}></Spin>
          </Col>
        </Row>
      ) : null}

      {response.data ? (
        <Form<FormData>
          initialValues={response.data}
          layout="vertical"
          form={form}
          onFinish={(values: FormData) => updateResponse.runAsync(values)}
          style={{ paddingTop: 16 }}
        >
          <Row gutter={24}>
            {props.courseId ? null : (
              <Col span={24}>
                <Form.Item name="courseId" label="Copy Tasks, Schedule from:">
                  <Select
                    placeholder="Select course template (Optional)"
                    options={props.courses.map(item => ({ label: item.name, value: item.id }))}
                  ></Select>
                </Form.Item>
              </Col>
            )}

            <Col span={24}>
              <Form.Item name="state">
                <Radio.Group>
                  <Radio value="active">Active</Radio>
                  <Radio value="planned">Planned</Radio>
                  <Radio value="completed">Completed</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col md={8} sm={12} span={24}>
              <Form.Item name="name" label=" Course Name" rules={[{ required: true, message: 'Please enter name' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={8} sm={12} span={24}>
              <Form.Item
                name="fullName"
                label="Full Course Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col md={8} sm={12} span={24}>
              <Form.Item
                name="discordServerId"
                label="Discord Server"
                rules={[{ required: true, message: 'Please select discord server' }]}
              >
                <Select
                  placeholder="Select discord server"
                  options={props.discordServers.map(({ id, name }) => ({ value: id, label: name }))}
                />
              </Form.Item>
            </Col>

            <Col md={8} sm={12} span={24}>
              <Form.Item name="alias" label="Alias" rules={[{ required: true, message: 'Please enter alias' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={8} sm={12} span={24}>
              <Form.Item name="certificateIssuer" label="Certificate Issuer">
                <Input />
              </Form.Item>
            </Col>

            <Col md={8} sm={12} span={24}>
              <Form.Item name="logo" label="Course Logo">
                <Select
                  options={courseIcons.map(icon => ({
                    value: icon.id,
                    label: (
                      <Flex>
                        <img src={icon.active} /> <span style={{ paddingLeft: 4 }}>{icon.label}</span>
                      </Flex>
                    ),
                  }))}
                  placeholder="Select logo"
                ></Select>
              </Form.Item>
            </Col>

            <Col md={8} sm={12} span={24}>
              <Form.Item
                name={['discipline', 'id']}
                label="Disciplines"
                rules={[{ required: true, message: 'Please select a discipline' }]}
              >
                <Select
                  placeholder="Select a discipline"
                  options={props.disciplines.map(({ id, name }) => ({ value: id, label: name }))}
                />
              </Form.Item>
            </Col>
            <Col sm={12} span={24}>
              <Form.Item
                name="range"
                label="Start - End Date"
                rules={[{ required: true, type: 'array', message: 'Please enter course date range' }]}
              >
                <DatePicker.RangePicker />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col md={8} sm={12} span={24}>
              <Form.Item
                name="registrationEndDate"
                label="Registration End Date"
                getValueFromEvent={date => date?.utc().endOf('day')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col md={8} sm={12} span={24}>
              <Form.Item
                name="certificateThreshold"
                label="Certificate Threshold"
                tooltip="Minimum score percentage required for students to qualify for a certificate."
                rules={[
                  {
                    required: true,
                    message: 'Please input the certificate threshold.',
                    type: 'integer',
                    min: 1,
                    max: 100,
                  },
                ]}
              >
                <InputNumber step={5} min={1} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col md={8} sm={12} span={24}>
              <Form.Item
                name="minStudentsPerMentor"
                label="Min Students per Mentor"
                rules={[
                  { min: 1, type: 'integer', message: 'Ensure that the input, if provided, is a positive integer.' },
                ]}
              >
                <InputNumber step={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col sm={12} span={24}>
              <Form.Item
                name="descriptionUrl"
                label="Description Url"
                rules={[{ required: true, message: 'Please enter course description' }]}
                shouldUpdate
              >
                <Select
                  options={[
                    { label: 'JavaScript Preschool RU', value: 'https://rs.school/courses/javascript-preschool-ru' },
                    { label: 'JavaScript', value: 'https://rs.school/courses/javascript' },
                    { label: 'JavaScript RU', value: 'https://rs.school/courses/javascript-ru' },
                    { label: 'React', value: 'https://rs.school/courses/reactjs' },
                    { label: 'Angular', value: 'https://rs.school/courses/angular' },
                    { label: 'Node.js', value: 'https://rs.school/courses/nodejs' },
                    { label: 'AWS Fundamentals', value: 'https://rs.school/courses/aws-fundamentals' },
                    { label: 'AWS Cloud Developer', value: 'https://rs.school/courses/aws-cloud-developer' },
                    { label: 'AWS DevOps', value: 'https://rs.school/courses/aws-devops' },
                    { label: 'Custom', value: 'custom' },
                  ]}
                ></Select>
              </Form.Item>
            </Col>

            <Col sm={12} span={24}>
              <Form.Item
                dependencies={['descriptionUrl']}
                hidden={descriptionUrl !== 'custom'}
                name="customDescriptionUrl"
                label="Custom Url"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col sm={12} span={24}>
              <Form.Item
                rules={[{ message: 'Please enter wearecommunity.io URL', pattern: wearecommunityRegex }]}
                name="wearecommunityUrl"
                label="wearecommunity.io URL"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col sm={12} span={24}>
              <Form.Item name={'certificateDisciplines'} label="RS school certificates are required">
                <Select
                  mode="multiple"
                  optionFilterProp="label"
                  placeholder="none"
                  options={certificateOptions}
                  onChange={handleCertificateChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="usePrivateRepositories" valuePropName="checked">
            <Checkbox>Use Private Repositories</Checkbox>
          </Form.Item>

          <Row gutter={24}>
            <Col md={8} sm={12} span={24}>
              <Form.Item name="personalMentoring" valuePropName="checked">
                <Checkbox>Personal mentoring</Checkbox>
              </Form.Item>
            </Col>
            <Col md={8} sm={12} span={24}>
              <Form.Item dependencies={['personalMentoring']}>
                {({ getFieldValue }) =>
                  getFieldValue('personalMentoring') ? (
                    <Form.Item
                      name="personalMentoringDateRange"
                      label="Personal Mentoring Dates"
                      rules={[{ required: true, type: 'array', message: 'Please enter mentoring dates' }]}
                    >
                      <DatePicker.RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="inviteOnly" valuePropName="checked">
            <Checkbox>Invite Only Course</Checkbox>
          </Form.Item>
        </Form>
      ) : null}
    </Modal>
  );
}

function createRecord(values: FormData) {
  const [startDate, endDate] = values.range as [dayjs.Dayjs, dayjs.Dayjs];
  const [personalMentoringStartDate, personalMentoringEndDate] = values.personalMentoringDateRange
    ? (values.personalMentoringDateRange as [dayjs.Dayjs, dayjs.Dayjs])
    : [null, null];

  const record: UpdateCourseDto = {
    name: values.name,
    fullName: values.fullName,
    alias: values.alias,
    startDate: startDate ? dayjs.utc(startDate).startOf('day').format() : undefined,
    endDate: endDate ? dayjs.utc(endDate).startOf('day').format() : undefined,
    registrationEndDate: values.registrationEndDate ? values.registrationEndDate.toISOString() : null,
    completed: values.state === 'completed',
    planned: values.state === 'planned',
    inviteOnly: values.inviteOnly,
    descriptionUrl: values.descriptionUrl === 'custom' ? values.customDescriptionUrl : values.descriptionUrl,
    disciplineId: values.discipline?.id,
    certificateIssuer: values.certificateIssuer,
    discordServerId: values.discordServerId,
    usePrivateRepositories: values.usePrivateRepositories,
    personalMentoring: values.personalMentoring,
    personalMentoringStartDate: personalMentoringStartDate
      ? dayjs.utc(personalMentoringStartDate).startOf('day').format()
      : null,
    personalMentoringEndDate: personalMentoringEndDate
      ? dayjs.utc(personalMentoringEndDate).startOf('day').format()
      : null,
    logo: values.logo,
    minStudentsPerMentor: values.minStudentsPerMentor,
    certificateThreshold: values.certificateThreshold,
    wearecommunityUrl: values.wearecommunityUrl,
    certificateDisciplines: values.certificateDisciplines?.map(String),
  };
  return record;
}

function getDateRange(
  startDate?: string | null,
  endDate?: string | null,
): [dayjs.Dayjs | null, dayjs.Dayjs | null] | null {
  return startDate && endDate ? [startDate ? dayjs.utc(startDate) : null, endDate ? dayjs.utc(endDate) : null] : null;
}

function getInitialValues(modalData: Partial<Course>): FormData {
  const range = getDateRange(modalData.startDate, modalData.endDate);
  const personalMentoringDateRange =
    getDateRange(modalData.personalMentoringStartDate, modalData.personalMentoringEndDate) || range;
  return {
    ...modalData,
    certificateDisciplines: modalData.certificateDisciplines,
    wearecommunityUrl: modalData.wearecommunityUrl ?? undefined,
    minStudentsPerMentor: modalData.minStudentsPerMentor || 2,
    certificateThreshold: modalData.certificateThreshold ?? 70,
    inviteOnly: !!modalData.inviteOnly,
    state: modalData.completed ? 'completed' : modalData.planned ? 'planned' : 'active',
    registrationEndDate: modalData.registrationEndDate ? dayjs.utc(modalData.registrationEndDate) : null,
    range: range,
    personalMentoringDateRange: personalMentoringDateRange,
  };
}
