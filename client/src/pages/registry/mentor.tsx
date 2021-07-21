import { Button, Checkbox, Tabs, Col, Form, Input, message, Result, Row, Select, Tag, Typography, Alert } from 'antd';
import { HeartTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { NextPageContext } from 'next';
import { PageLayout } from 'components';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { GdprCheckbox, LocationSelect } from 'components/Forms';
import withSession from 'components/withSession';
import { useCallback, useState, useEffect } from 'react';
import { useAsync, useUpdate } from 'react-use';
import { CoursesService } from 'services/courses';
import { formatMonthFriendly } from 'services/formatter';
import { UserFull, UserService } from 'services/user';
import { emailPattern, epamEmailPattern, phonePattern } from 'services/validators';
import { Course, Location } from '../../../../common/models';
import { Props } from '../../configs/registry';

const rsschoolBotLink = 'https://t.me/rsschool_bot?start';

const defaultColumnSizes = { xs: 20, sm: 16, md: 12, lg: 10 };
const textColumnSizes = { xs: 22, sm: 14, md: 12, lg: 10 };
const defaultRowGutter = 24;

function Page(props: Props & { courseAlias?: string }) {
  const [form] = Form.useForm();
  const [isAvailableContact, setIsAvailableContact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState(null as Location | null);
  const [courses, setCourses] = useState([] as Course[]);
  const [checkedList, setCheckedListCourse] = useState([] as number[]);
  const [initialData, setInitialData] = useState(null as Partial<UserFull> | null);
  const update = useUpdate();

  useAsync(async () => {
    setLoading(true);
    const [profile, courses] = await Promise.all([new UserService().getMyProfile(), new CoursesService().getCourses()]);

    const activeCourses = props.courseAlias
      ? courses.filter((course: Course) => course.alias === props.courseAlias)
      : courses
          .filter(course => (course.planned || !course.completed) && !course.inviteOnly)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const checkedListCourse = props.courseAlias
      ? courses.filter((course: Course) => course.alias === props.courseAlias).map(({ id }: Course) => id)
      : [];

    setInitialData(profile);
    setCourses(activeCourses);

    setCheckedListCourse(checkedListCourse);
    setLoading(false);

    setIsAvailableContact(
      !!profile.contactsSkype.trim() || !!profile.contactsPhone.trim() || !!profile.contactsTelegram.trim(),
    );
  }, []);

  useEffect(() => {
    setLocation({
      countryName: initialData?.countryName,
      cityName: initialData?.cityName,
    } as Location);
  }, [initialData]);

  const checkKeyMatch = (e: any) => {
    // The length of the nickname in telegrams or skype must be more than 2 or more characters
    setIsAvailableContact(e.target.value.length >= 2);
  };

  const handleSubmit = useCallback(async (model: any) => {
    setLoading(true);
    const {
      technicalMentoring,
      preferedCourses,
      preferedStudentsLocation,
      maxStudentsLimit,
      englishMentoring,
      location,
    } = model;

    const registryModel = {
      preferedCourses,
      maxStudentsLimit,
      englishMentoring,
      preferedStudentsLocation,
      technicalMentoring,
    };

    const userModel = {
      cityName: location.cityName,
      countryName: location.countryName,
      firstName: model.firstName,
      lastName: model.lastName,

      primaryEmail: model.primaryEmail,
      contactsTelegram: model.contactsTelegram,
      contactsSkype: model.contactsSkype,
      contactsPhone: model.contactsPhone,
      contactsEpamEmail: model.contactsEpamEmail,
      contactsNotes: model.contactsNotes,
      aboutMyself: model.aboutMyself,
    };

    const requests = [axios.post('/api/profile/me', userModel), axios.post('/api/registry/mentor', registryModel)];

    try {
      await Promise.all(requests);
      setSubmitted(true);
    } catch (e) {
      message.error('An error occured. Please try later');
    } finally {
      setLoading(false);
    }
  }, []);

  let content: React.ReactNode = null;
  if (loading) {
    content = null;
  } else if (submitted) {
    content = <SuccessComponent />;
  } else if (initialData) {
    content = (
      <Row gutter={defaultRowGutter}>
        <Col xs={24} sm={20} md={18} lg={16} xl={16}>
          <Row style={{ marginBottom: 8 }}>
            <Tabs defaultActiveKey="english">
              <Tabs.TabPane key="english" tab="About mentorship">
                <ul>
                  <li>Topics: html/css/javascript + tools and ecosystem with React or Angular</li>
                  <li>Fully prepared materials and home tasks for you, infrastructure.</li>
                  <li>From 2 to 6 students per a mentor.</li>
                  <li>Partially or fully remote.</li>
                </ul>
                <ul>
                  <b>Responsibilities:</b>
                  <li>Weekly meeting with your students group in any messenger remotely</li>
                  <li>Answer questions</li>
                  <li>Give advises (code style, tasks decomposition)</li>
                  <li>Check and mark home tasks (~7 in total)</li>
                  <li>Hold education interviews (2 per each student)</li>
                </ul>
              </Tabs.TabPane>
              <Tabs.TabPane key="russian" tab="О менторинге">
                <ul>
                  <li>Темы менторинга: html/css/vanillajs.</li>
                  <li>
                    С вашей стороны требуется возможность уделять 4-8 часов в неделю или более (по вашему желанию).
                  </li>
                  <li>Можно менторить от 2 до 6 студентов.</li>
                  <li>Менторить можно удаленно.</li>
                </ul>
                <ul>
                  <b>Задачи ментора:</b>
                  <li>
                    Еженедельно встречаться с вашей группой студентов (можно в Skype, Google Hangouts, Gitter, Slack и
                    т.д.)
                  </li>
                  <li>Отвечать на вопросы студентов</li>
                  <li>Давать советы (code style, разбор заданий)</li>
                  <li>Проверять и оценивать работы студентов (~7 заданий)</li>
                  <li>Проводить учебные интервью (по 2 для каждого студента)</li>
                  <li>Проводить дополнительные лекции (по желанию)</li>
                </ul>
              </Tabs.TabPane>
            </Tabs>
            <Typography.Title level={4}>О менторинге</Typography.Title>
          </Row>
          <Form
            style={{ margin: 16 }}
            layout="vertical"
            form={form}
            initialValues={getInitialValues(initialData, checkedList)}
            onChange={update}
            onFinish={handleSubmit}
            onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
          >
            <Row>
              <Typography.Title level={4}>General</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'First name should be in English' }]}
                >
                  <Input placeholder="Dzmitry" />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Last name should be in English' }]}
                >
                  <Input placeholder="Varabei" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item name="preferedCourses" label="Preferred Courses">
                  <Checkbox.Group
                    value={checkedList}
                    options={courses.map(c => ({
                      label: (
                        <>
                          {`${c.name} (Start: ${formatMonthFriendly(c.startDate)})`}{' '}
                          {c.planned ? <Tag color="orange">Planned</Tag> : <Tag color="green">In Progress</Tag>}
                        </>
                      ),
                      value: c.id,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="maxStudentsLimit"
                  label="How many students are you ready to mentor per course?"
                  rules={[{ required: true, message: 'Please select students count' }]}
                >
                  <Select placeholder="Select students count...">
                    <Select.Option value={2}>2</Select.Option>
                    <Select.Option value={3}>3</Select.Option>
                    <Select.Option value={4}>4</Select.Option>
                    <Select.Option value={5}>5</Select.Option>
                    <Select.Option value={6}>6</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item name="englishMentoring" valuePropName="checked" label="Are you ready to mentor in ENGLISH?">
                  <Checkbox>Yes, I am ready</Checkbox>
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="preferedStudentsLocation"
                  label="Preferred students location"
                  rules={[{ required: true, message: 'Please select a preferred location option' }]}
                >
                  <Select placeholder="Select a preferred option...">
                    <Select.Option value={'any'}>Any city or country</Select.Option>
                    <Select.Option value={'country'}>My country only</Select.Option>
                    <Select.Option value={'city'}>My city only</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item name="technicalMentoring" label="Please pick technologies which you want to mentor in">
                  <Select mode="multiple" placeholder="Select technologies...">
                    <Select.Option value={'nodejs'}>Node.js</Select.Option>
                    <Select.Option value={'react'}>React</Select.Option>
                    <Select.Option value={'angular'}>Angular</Select.Option>
                    <Select.Option value={'ios'}>iOS</Select.Option>
                    <Select.Option value={'android'}>Android</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <span>We need your location for understanding audience and use it for students distribution.</span>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: 'Please select city' }]}
                  valuePropName={'location'}
                >
                  <LocationSelect onChange={setLocation} location={location} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <span>Preferable to use Gmail because we use Google Drive for sharing</span>
                <Form.Item
                  name="primaryEmail"
                  label="Primary Email"
                  rules={[{ required: true, pattern: emailPattern, message: 'Email is required' }]}
                >
                  <Input placeholder="user@example.com" />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <span>If you are EPAM employee, please specify your email to avoid some manual processes later</span>
                <Form.Item
                  name="contactsEpamEmail"
                  label="EPAM Email (if applicable)"
                  rules={[{ message: 'Please enter a valid EPAM email', pattern: epamEmailPattern }]}
                >
                  <Input placeholder="first_last@epam.com" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...textColumnSizes}>
                <Form.Item name="aboutMyself" label="About Yourself">
                  <Input.TextArea placeholder="A couple words about yourself..." />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Typography.Title level={4}>Contacts</Typography.Title>
            </Row>
            <Row>
              <Col {...defaultColumnSizes}>
                <Typography.Paragraph type="warning">
                  Your contacts will be shared with your students.
                </Typography.Paragraph>
                <Typography.Paragraph mark>
                  Enter one of the contacts below to be able to contact you!
                </Typography.Paragraph>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item name="contactsTelegram" label="Telegram" rules={[{ required: !isAvailableContact }]}>
                  <Input addonBefore="@" placeholder="durov" onChange={checkKeyMatch} />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item name="contactsSkype" label="Skype" rules={[{ required: !isAvailableContact }]}>
                  <Input placeholder="johnsmith" onChange={checkKeyMatch} />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="contactsPhone"
                  label="Phone"
                  rules={[
                    { required: !isAvailableContact, pattern: phonePattern, message: 'Please enter a valid phone' },
                  ]}
                >
                  <Input placeholder="+375297775533" onChange={checkKeyMatch} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item name="contactsNotes" label="Contact Notes">
                  <Input.TextArea placeholder="Preferable time to contact, planned day offs etc." />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Typography.Paragraph>
                <Alert
                  message={
                    <span>
                      Subscribe to our{' '}
                      <a href={rsschoolBotLink} target="_blank">
                        Telegram-bot
                      </a>{' '}
                      to keep in touch with us.
                    </span>
                  }
                  showIcon
                />
              </Typography.Paragraph>
            </Row>

            <Row>
              <GdprCheckbox />
            </Row>
            <Button size="large" type="primary" disabled={!form.getFieldValue('gdpr') || loading} htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    );
  }

  return (
    <PageLayout title="Registration" loading={loading} githubId={props.session.githubId}>
      {content}
    </PageLayout>
  );
}

const SuccessComponent = () => {
  const titleCmp = (
    <Row gutter={24} justify="center">
      <Col xs={18} sm={16} md={12}>
        <p>Your application has been saved!</p>
        <p>
          Subscribe to our <a href={rsschoolBotLink}>Telegram-bot</a>. Before the start of the course, it will send you
          the message to confirm your participation in the course and provide the next steps.
        </p>
        <p>
          Thanks a lot for your interest! <HeartTwoTone twoToneColor="#eb2f96" />
        </p>
        <p>
          <Button type="primary" href="/">
            Go to Home
          </Button>
        </p>
      </Col>
    </Row>
  );
  return <Result status="info" title={titleCmp} />;
};

function getInitialValues({ countryName, cityName, ...initialData }: Partial<UserFull>, checkedList: number[]) {
  const location =
    countryName &&
    cityName &&
    ({
      countryName,
      cityName,
    } as Location | null);
  return {
    ...initialData,
    location,
    preferedCourses: checkedList,
    englishMentoring: false,
    technicalMentoring: [],
  };
}

const RegistryPage: any = withGoogleMaps(withSession(Page));
RegistryPage.getInitialProps = async (context: NextPageContext) => {
  try {
    const courseAlias = context.query.course;
    return { courseAlias };
  } catch (e) {
    console.error(e.message);
    return { courseAlias: undefined };
  }
};

export default RegistryPage;
