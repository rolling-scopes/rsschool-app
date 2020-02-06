import { MehTwoTone } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Radio, Result, Row, Select, Typography } from 'antd';
import axios from 'axios';
import { PageLayout } from 'components';
import { CommentInput, GdprCheckbox } from 'components/Forms';
import { LocationSelect } from 'components/LocationSelect';
import withSession from 'components/withSession';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { CoursesService } from 'services/courses';
import { formatMonthFriendly } from 'services/formatter';
import { Course } from 'services/models';
import { UserFull, UserService } from 'services/user';
import { emailPattern, epamEmailPattern, phonePattern } from 'services/validators';
import { Props, TYPES } from '../../configs/registry';

const defaultColumnSizes = { xs: 18, sm: 10, md: 8, lg: 6 };
const textColumnSizes = { xs: 22, sm: 14, md: 12, lg: 10 };
const defaultRowGutter = 24;
const noticeStyle = {
  lineHeight: '20px',
  display: 'block',
  fontStyle: 'italic',
};

function Page(props: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [courses, setCourses] = useState([] as Course[]);
  const [initialData, setInitialData] = useState({} as Partial<UserFull>);

  useAsync(async () => {
    setLoading(true);
    const [profile, courses] = await Promise.all([new UserService().getMyProfile(), new CoursesService().getCourses()]);

    const activeCourses = courses
      .filter(course => (course.planned || !course.completed) && !course.inviteOnly)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    setLoading(false);
    setInitialData(profile);
    setCourses(activeCourses);
  }, []);

  const handleSubmit = useCallback(async (model: any) => {
    setLoading(true);
    const { comment, location, courseId, maxStudentsLimit, experienceInYears } = model;
    const registryModel = {
      courseId,
      comment,
      maxStudentsLimit,
      experienceInYears,
      type: TYPES.MENTOR,
    };

    const userModel = {
      locationId: location.key ? location.key : undefined,
      locationName: !location.key ? model.otherLocationName : location.label,
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

    const requests = [axios.post('/api/profile/registry', userModel), axios.post('/api/registry', registryModel)];

    try {
      const [, registryResponse] = await Promise.all(requests);
      const response = registryResponse.data;
      const isApproved = response ? response.data.status === 'approved' : false;
      setApproved(isApproved);
      setSubmitted(true);
    } catch (e) {
      message.error('An error occured. Please try later');
    } finally {
      setLoading(false);
    }
  }, []);

  let content: React.ReactNode;
  if (loading) {
    content = null;
  } else if (!courses.length) {
    content = (
      <Result
        status="info"
        icon={<MehTwoTone />}
        title="There are no planned courses."
        subTitle="Please come back later."
        extra={
          <Button type="primary" href="/">
            Go to Home
          </Button>
        }
      />
    );
  } else if (submitted) {
    content = (
      <Result
        status={approved ? 'success' : 'info'}
        title={
          <>
            <Row gutter={24} justify="center">
              <Col xs={18} sm={16} md={12}>
                <p>Thanks a lot for registration!</p>
                {!approved && (
                  <p>We got your request and will review it soon. After that you will get an access to the course</p>
                )}
                {approved && <p>Your request has been approved. </p>}
                <p>
                  We will send you an invitation to the introduction meeting when the course is started. Stay tuned!
                </p>
                <p>
                  Join our <a href="https://t.me/joinchat/HqpGRxNRANkGN2xx9bL8zQ">RSSchool Mentors FAQ</a> Telegram
                  group.
                </p>
                {!approved && <p>P.S. Please do not try to submit another request</p>}
                <p>
                  <Button type="primary" href="/">
                    Go to Home
                  </Button>
                </p>
              </Col>
            </Row>
          </>
        }
      />
    );
  } else {
    const location = form.getFieldValue('location');
    const courseId = form.getFieldValue('courseId');
    const [course] = courses.filter(c => c.id === courseId);
    content = content = (
      <Form initialValues={getInitialValues(initialData, courses)} form={form} className="m-2" onFinish={handleSubmit}>
        <Col style={{ margin: '0 20px' }}>
          <Row>
            <Typography.Title level={4}>Course</Typography.Title>
          </Row>
          <Row gutter={defaultRowGutter}>
            <Col span={10}>
              <Form.Item name="courseId">
                <Select placeholder="Select course...">
                  {courses.map(course => (
                    <Select.Option key={course.id} value={course.id}>
                      {course.name} ({course.primarySkillName}, {formatMonthFriendly(course.startDate)})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {course && <Typography.Paragraph type="secondary">{course.description}</Typography.Paragraph>}
              <Row>
                <Typography.Title level={4}>О менторинге</Typography.Title>
              </Row>
              <Typography.Paragraph>
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
              </Typography.Paragraph>
            </Col>
          </Row>
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
              <Form.Item
                name="maxStudentsLimit"
                label="How many students are you ready to mentor?"
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
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please select city or "Other"' }]}
              >
                <LocationSelect placeholder="Select city" />
              </Form.Item>
            </Col>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="otherLocationName"
                label="Other Location"
                rules={[{ required: location && !location.key, message: 'Location name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={defaultRowGutter}>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="primaryEmail"
                label="Primary Email"
                rules={[{ required: true, pattern: emailPattern, message: 'Email is required' }]}
              >
                <span style={noticeStyle}>Preferable to use Gmail because we use Google Drive for sharing</span>
                <Input placeholder="user@example.com" />
              </Form.Item>
            </Col>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="contactsEpamEmail"
                label="EPAM Email (if applicable)"
                rules={[{ message: 'Please enter a valid EPAM email', pattern: epamEmailPattern }]}
              >
                <span style={noticeStyle}>
                  If you are EPAM employee, please specify your email to avoid some manual processes later
                </span>
                <Input placeholder="first_last@epam.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={defaultRowGutter}>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="experienceInYears"
                label="How many years of production experience do you have?"
                rules={[{ required: true, message: 'Please specify your experience' }]}
              >
                <Radio.Group>
                  <Radio value="0-1">{`< 1 year`}</Radio>
                  <Radio value="1-2">{`< 2 years`}</Radio>
                  <Radio value="2-5">{`2-5 years`}</Radio>
                  <Radio value="5-10">{`> 5 years`}</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={defaultRowGutter}>
            <Col {...textColumnSizes}>
              <Form.Item name="aboutMyself" label="About Youself">
                <Input.TextArea placeholder="A couple words about yourself..." />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Typography.Title level={4}>Contacts</Typography.Title>
            <Typography.Text type="warning">Your contacts will be shared with your students.</Typography.Text>
          </Row>
          <Row gutter={defaultRowGutter}>
            <Col {...defaultColumnSizes}>
              <Form.Item name="contactsTelegram" label="Telegram">
                <Input addonBefore="@" placeholder="durov" />
              </Form.Item>
            </Col>
            <Col {...defaultColumnSizes}>
              <Form.Item name="contactsSkype" label="Skype">
                <Input placeholder="johnsmith" />
              </Form.Item>
            </Col>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="contactsPhone"
                label="Phone"
                rules={[{ pattern: phonePattern, message: 'Please enter a valid phone' }]}
              >
                <Input placeholder="+375297775533" />
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

          <Row gutter={defaultRowGutter}>
            <Col {...textColumnSizes}>
              <CommentInput />
            </Col>
          </Row>

          <Row>
            <Typography.Paragraph>
              I hereby agree to the processing of my personal data contained in the application and sharing it with
              companies only for students employment purposes.
            </Typography.Paragraph>
            <Typography.Paragraph>
              Я согласен на обработку моих персональных данных, содержащихся в приложении, и передачу их компаниям
              только в целях трудоустройства студентов.
            </Typography.Paragraph>
            <GdprCheckbox />
          </Row>
          <Button size="large" type="primary" disabled={!form.getFieldValue('gdpr') || loading} htmlType="submit">
            Submit
          </Button>
        </Col>
      </Form>
    );
  }

  return (
    <PageLayout title="Registration" loading={loading} githubId={props.session.githubId}>
      {content}
    </PageLayout>
  );
}

export default withSession(Page);

function getInitialValues(initialData, courses) {
  return {
    ...initialData,
    courseId: courses?.[0]?.id,
    location: initialData.locationId ? { key: initialData.locationId } : undefined,
  };
}
