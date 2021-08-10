import {
  Button,
  Checkbox,
  Steps,
  Col,
  Form,
  Input,
  message,
  Result,
  Row,
  Select,
  Tag,
  Typography,
  Alert,
  Tooltip,
} from 'antd';
import { HeartTwoTone, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { NextPageContext } from 'next';
import { useCallback, useState, useEffect } from 'react';
import { useAsync, useUpdate } from 'react-use';
import { css } from 'styled-jsx/css';

import { RegistrationPageLayout } from 'components';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { LocationSelect } from 'components/Forms';
import withSession from 'components/withSession';
import { CoursesService } from 'services/courses';
import { formatMonthFriendly } from 'services/formatter';
import { UserFull, UserService } from 'services/user';
import { emailPattern, epamEmailPattern, englishNamePattern } from 'services/validators';
import { Course, Location } from '../../../../common/models';
import { Props } from '../../configs/registry';

const rsschoolBotLink = 'https://t.me/rsschool_bot?start';

const TEXT_LOCATION_TOOLTIP = 'We need your location for understanding the audience and for mentor distribution.';
const TEXT_EMAIL_TOOLTIP = 'No spam e-mails. Only for course purposes.';
const TEXT_EPAM_EMAIL_TOOLTIP =
  'If you are EPAM employee, please specify your email to avoid some manual processes later';

const technology = [
  { id: 'nodejs', displayName: 'Node.js' },
  { id: 'react', displayName: 'React' },
  { id: 'angular', displayName: 'Angular' },
  { id: 'ios', displayName: 'IOS' },
  { id: 'android', displayName: 'Android' },
];

const defaultColumnSizes = { xs: 24, sm: 24, md: 24, lg: 24, xl: 24 };
const defaultDoubleColumnSizes = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 };
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
  const [startPage, setStartPage] = useState(true);
  const [currentStep, setCurrentSteps] = useState(0);
  const [resume, setResume] = useState(null as any | null);

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
    if (initialData) {
      setResume(getInitialValues(initialData, checkedList));

    }

    setLoading(false);

    setIsAvailableContact(!!profile.contactsSkype.trim() || !!profile.contactsTelegram.trim());
  }, []);

  useEffect(() => {
    setLocation({
      countryName: initialData?.countryName,
      cityName: initialData?.cityName,
    } as Location);

    if (initialData) {
      setResume(getInitialValues(initialData, checkedList));
    }
  }, [initialData]);

  const checkKeyMatch = (e: any) => {
    // The length of the nickname in telegrams or skype must be more than 2 or more characters
    setIsAvailableContact(e.target.value.length >= 2);
  };

  const handleSubmit = useCallback(async (model: any) => {
    if (!currentStep) {
      setCurrentSteps(currentStep + 1);
      setResume({ ...resume, ...model });
    } else {
      setLoading(true);
      setResume({ ...resume, ...model });
      const {
        technicalMentoring,
        preferedCourses,
        preferedStudentsLocation,
        maxStudentsLimit,
        englishMentoring,
        location,
      } = resume;

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
        firstName: resume.firstName,
        lastName: resume.lastName,

        primaryEmail: resume.primaryEmail,
        contactsTelegram: resume.contactsTelegram,
        contactsSkype: resume.contactsSkype,
        contactsEpamEmail: resume.contactsEpamEmail,
        contactsNotes: resume.contactsNotes,
        aboutMyself: resume.aboutMyself,
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
    }
  }, []);

  const prev = () => {
    if (!currentStep) {
      setStartPage(true);
    } else {
      setCurrentSteps(currentStep - 1);
    }
  };

  const getContentGeneral = () => (
    <>
      <Row>
        <Typography.Title style={{ marginBottom: 32 }} level={3}>
          General
        </Typography.Title>
      </Row>

      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes}>
          <Row>
            <Typography.Title level={5}>Preferred Courses</Typography.Title>
          </Row>
          <Form.Item name="preferedCourses">
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
        <Col {...defaultDoubleColumnSizes} style={{ marginBottom: 24 }}>
          <Row>
            <Typography.Title level={5}>First Name</Typography.Title>
          </Row>
          <Row>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="firstName"
                style={{ marginBottom: '0' }}
                rules={[{ required: true, pattern: englishNamePattern, message: 'First name should be in English' }]}
              >
                <Input placeholder="Dzmitry" />
              </Form.Item>
            </Col>
          </Row>
          <span className="descriptions-name">In English, as in passport</span>
        </Col>
        <Col {...defaultDoubleColumnSizes} style={{ marginBottom: 24 }}>
          <Row>
            <Typography.Title level={5}>Last Name</Typography.Title>
          </Row>
          <Row>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="lastName"
                style={{ marginBottom: '0' }}
                rules={[{ required: true, pattern: englishNamePattern, message: 'Last name should be in English' }]}
              >
                <Input placeholder="Varabei" />
              </Form.Item>
            </Col>
          </Row>
          <span className="descriptions-name last">In English, as in passport</span>
        </Col>
      </Row>
      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes}>
          <Row>
            <Typography.Title level={5}>Location {getInfoCircle(TEXT_LOCATION_TOOLTIP)}</Typography.Title>
          </Row>
          <Row>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="location"
                rules={[{ required: true, message: 'Please select city' }]}
                valuePropName={'location'}
              >
                <LocationSelect onChange={setLocation} location={location} />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes}>
          <Row>
            <Typography.Title level={5}>E-mail {getInfoCircle(TEXT_EMAIL_TOOLTIP)}</Typography.Title>
          </Row>
          <Row>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="primaryEmail"
                rules={[{ required: true, pattern: emailPattern, message: 'Email is required' }]}
              >
                <Input placeholder="user@example.com" />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes}>
          <Row>
            <Typography.Title level={5}>EPAM E-mail {getInfoCircle(TEXT_EPAM_EMAIL_TOOLTIP)}</Typography.Title>
          </Row>
          <Row>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="contactsEpamEmail"
                rules={[{ message: 'Please enter a valid EPAM email', pattern: epamEmailPattern }]}
              >
                <Input placeholder="first_last@epam.com" />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={defaultRowGutter}>
        <Col {...defaultDoubleColumnSizes} style={{ marginBottom: 24 }}>
          <Row>
            <Typography.Title level={5}>Telegram</Typography.Title>
          </Row>
          <Row>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="contactsTelegram"
                style={{ marginBottom: '0' }}
                rules={[{ required: !isAvailableContact }]}
              >
                <Input addonBefore="@" placeholder="durov" onChange={checkKeyMatch} />
              </Form.Item>
              <Typography.Paragraph style={{ margin: '12px 0 0 0' }}>
                <Alert
                  type="info"
                  message={
                    <span>
                      Subscribe to our{' '}
                      <a href={rsschoolBotLink} target="_blank">
                        Telegram-bot
                      </a>{' '}
                      to keep in touch with us.
                    </span>
                  }
                />
              </Typography.Paragraph>
            </Col>
          </Row>
        </Col>
        <Col {...defaultDoubleColumnSizes} style={{ marginBottom: 24 }}>
          <Row>
            <Typography.Title level={5}>Skype</Typography.Title>
          </Row>
          <Row>
            <Col {...defaultColumnSizes}>
              <Form.Item name="contactsSkype" style={{ marginBottom: '0' }} rules={[{ required: !isAvailableContact }]}>
                <Input placeholder="johnsmith" onChange={checkKeyMatch} />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes}>
          <Row>
            <Typography.Title level={5}>Contact Notes</Typography.Title>
          </Row>
          <Row>
            <Col {...defaultColumnSizes}>
              <Form.Item name="contactsNotes">
                <Input.TextArea rows={4} placeholder="Preferable time to contact, planned day offs etc." />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );

  const getContentMentorship = () => (
    <>
      <Row>
        <Typography.Title style={{ marginBottom: 32 }} level={3}>
          Mentorship
        </Typography.Title>
      </Row>

      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes}>
          <Row>
            <Typography.Title level={5}>Pick technology which you can mentor</Typography.Title>
          </Row>
          <Form.Item name="technicalMentoring">
            <Checkbox.Group
              className="technology"
              value={checkedList}
              options={technology.map(c => ({
                label: <Row style={{ minWidth: 240 }}>{`${c.displayName}`}</Row>,
                value: c.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes}>
          <Row>
            <Typography.Title level={5}>How many students are you ready to mentor per course?</Typography.Title>
          </Row>
          <Form.Item name="maxStudentsLimit" rules={[{ required: true, message: 'Please select students count' }]}>
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
          <Row>
            <Typography.Title level={5}>Preferred students location</Typography.Title>
          </Row>
          <Form.Item
            name="preferedStudentsLocation"
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
          <Row>
            <Typography.Title level={5}>Are you ready to mentor in ENGLISH?</Typography.Title>
          </Row>
          <Form.Item name="englishMentoring" valuePropName="checked">
            <Checkbox>Yes, I am ready</Checkbox>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes}>
          <Row>
            <Typography.Title level={5}>About Yourself</Typography.Title>
          </Row>
          <Form.Item name="aboutMyself">
            <Input.TextArea rows={6} placeholder="A couple words about yourself..." />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={defaultRowGutter}>
        <Col {...defaultColumnSizes} style={{ marginBottom: 40 }}>
          <span>
            By clicking on the button, I agree to the processing of my personal data contained in the application and
            sharing it with companies only for students employment purposes.
          </span>
        </Col>
      </Row>
    </>
  );

  const steps = [
    {
      title: 'General',
      content: getContentGeneral,
    },
    {
      title: 'Mentorship',
      content: getContentMentorship,
    },
  ];

  let content: React.ReactNode = null;
  if (loading) {
    content = null;
  } else if (submitted) {
    content = <SuccessComponent />;
  } else if (resume) {
    const { Step } = Steps;
    content = (
      <Form
        style={{ margin: 16 }}
        layout="vertical"
        form={form}
        initialValues={resume}
        onChange={update}
        onFinish={handleSubmit}
        onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
      >
        {startPage ? (
          <div className="about-mentorship">
            <div className="about-mentorship-slide">
              <header>
                <img className="rss-logo" src="/static/images/logo-rsschool3.png" alt="Rolling Scopes School Logo" />
                <p className="rss-logo-descriptions">Free courses from the developer community</p>
              </header>
              <footer>
                <img className="logo" src="/static/svg/logo-github.svg" alt="GitHub Logo" />
                <img className="logo-rs" src="/static/svg/logo-rs.svg" alt="Rolling Scopes Logo" />
                <img className="logo" src="/static/svg/logo-epam.svg" alt="EPAM Logo" />
              </footer>
            </div>
            <div className="about-mentorship-content">
              <Row>
                <Typography.Title level={3}>About mentorship</Typography.Title>
              </Row>

              <Row gutter={defaultRowGutter}>
                <Col {...defaultColumnSizes}>
                  <Typography.Paragraph style={{ fontSize: 14, marginBottom: 32, marginTop: 15 }}>
                    You are required to mentor students (from 2 to 6) and coach them 4-8 hours a week (or more, if you
                    wish). Mentoring topics - html/css/vanillajs. You can teach them remotely.
                  </Typography.Paragraph>
                </Col>
              </Row>

              <Row>
                <Typography.Title level={4}>Responsibilities:</Typography.Title>
              </Row>

              <Row gutter={defaultRowGutter}>
                <Col {...defaultColumnSizes}>
                  <Typography.Paragraph style={{ fontSize: 14, marginTop: 10 }}>
                    As a mentor you will meet weekly with your group of students in any messenger that is convenient for
                    you, answer questions and share your experience.
                  </Typography.Paragraph>

                  <Typography.Paragraph style={{ fontSize: 14, marginBottom: 40 }}>
                    It will also be necessary to check and evaluate student’s work (about 7 tasks), conduct training
                    interviews (2 for each student) and give additional lectures (if you wish).
                  </Typography.Paragraph>
                </Col>
              </Row>

              <Button size="large" type="primary" onClick={() => setStartPage(false)}>
                Register
              </Button>
            </div>
          </div>
        ) : (
          <div className="mentor-registration">
            <div className="mentor-registration-slide">
              <header>
                <img className="rss-logo" src="/static/images/logo-rsschool3.png" alt="Rolling Scopes School Logo" />
                <div className="steps-wrapper">
                  <Steps direction="vertical" current={currentStep} style={{ height: 150 }}>
                    {steps.map(step => (
                      <Step className="bla-bla=bla" key={step.title} title={step.title} />
                    ))}
                  </Steps>
                </div>
              </header>
              <footer>
                <img className="logo" src="/static/svg/logo-github.svg" alt="GitHub Logo" />
                <img className="logo-rs" src="/static/svg/logo-rs.svg" alt="Rolling Scopes Logo" />
                <img className="logo" src="/static/svg/logo-epam.svg" alt="EPAM Logo" />
              </footer>
            </div>
            <div className="mentor-registration-content">
              {steps[currentStep].content()}
              <div className="steps-action">
                {currentStep < steps.length - 1 && (
                  <Button size="large" type="primary" htmlType="submit">
                    Next
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button size="large" type="primary" htmlType="submit">
                    Submit
                  </Button>
                )}
                {currentStep > 0 && (
                  <Button size="large" style={{ margin: '0 16px' }} onClick={() => prev()}>
                    Previous
                  </Button>
                )}
                {currentStep === 0 && (
                  <Button size="large" style={{ margin: '0 16px' }} onClick={() => setStartPage(true)}>
                    Previous
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        <style jsx>{styles}</style>
      </Form>
    );
  }

  return (
    <RegistrationPageLayout loading={loading} githubId={props.session.githubId}>
      {content}
    </RegistrationPageLayout>
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

const getInfoCircle = (text: string) => {
  return (
    <Tooltip title={text} color="#000000bf">
      <InfoCircleOutlined style={{ fontSize: 13 }} />
    </Tooltip>
  );
};

const styles = css`
  .about-mentorship,
  .mentor-registration {
    max-width: 970px;
    margin: 0 auto;
    background-color: #fff;
    display: flex;
    font-size: 12px;
    box-shadow: 1px 1px 10px #59595940;
  }
  .ant-typography {
    font-size: 14px;
  }
  .rss-logo {
    margin: 38px 24px 0 24px;
    height: 64px;
    -webkit-filter: invert(100%);
    filter: invert(100%);
  }
  .rss-logo-descriptions {
    margin: 32px 24px 0 24px;
    padding: 4px 0;
    font-size: 14px;
    font-weight: 700;
    background-color: #ffec3d;
    text-align: center;
  }
  .about-mentorship-slide {
    background-color: #141414;
    width: 350px;
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .mentor-registration-slide {
    background-color: #141414;
    max-width: 225px;
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  footer {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 10px 30px;
  }
  .about-mentorship-content {
    padding: 72px 150px 64px 150px;
    flex: 3;
  }
  .mentor-registration-content {
    padding: 40px 125px 64px 147px;
    flex: 3;
  }
  .descriptions-name {
    color: rgba(0, 0, 0, 0.45);
  }
  .descriptions-name.last {
    visibility: hidden;
  }
  .logo {
    height: 20px;
  }
  .logo-rs {
    height: 40px;
  }
  .steps-wrapper {
    margin: 100px 0 0 25px;
  }
  .steps-wrapper :global(.ant-steps-item-wait .ant-steps-item-icon) {
    background: #141414 !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
  }
  .steps-wrapper :global(.ant-steps-item-wait .ant-steps-item-icon .ant-steps-icon) {
    color: rgba(255, 255, 255, 0.3) !important;
    font-weight: 500;
  }
  .steps-wrapper :global(.ant-steps-item-process .ant-steps-item-icon) {
    background: #fadb14 !important;
    border-color: #fadb14 !important;
  }
  .steps-wrapper :global(.ant-steps-item-process .ant-steps-item-icon .ant-steps-icon) {
    color: #1f1f1f !important;
    font-weight: 500;
    top: -3px;
  }
  .steps-wrapper :global(.ant-steps-item-process .ant-steps-item-tail::after) {
    background-color: rgba(255, 255, 255, 0.3) !important;
  }
  .steps-wrapper :global(.ant-steps-item-finish .ant-steps-item-icon) {
    background: #141414 !important;
    border-color: #fadb14 !important;
  }
  .steps-wrapper :global(.ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon) {
    color: #fadb14 !important;
    font-weight: 500;
  }
  .steps-wrapper :global(.ant-steps-item-finish .ant-steps-item-tail::after) {
    background-color: #fadb14 !important;
  }
  .steps-wrapper :global(.ant-steps-item-content .ant-steps-item-title) {
    color: rgba(255, 255, 255, 0.85) !important;
  }
  @media (max-width: 768px) {
    .about-mentorship-content,
    .mentor-registration-content {
      padding: 32px 24px 80px 24px;
    }
    .about-mentorship-slide,
    .mentor-registration-slide {
      background-color: #141414;
      width: 220px;
    }
  }
  @media (max-width: 575px) {
    .about-mentorship,
    .mentor-registration {
      flex-direction: column;
    }
    .about-mentorship-slide,
    .mentor-registration-slide {
      background-color: #141414;
      width: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
    }
    .mentor-registration-slide {
      max-width: 100vw;
    }
    .rss-logo {
      margin: 22px auto;
      height: 45px;
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }
    .rss-logo-descriptions {
      margin: 0 16px 16px;
    }
    .descriptions-name.last {
      visibility: visible;
    }
    footer {
      display: none;
    }
    header {
      display: contents;
    }
    .steps-wrapper {
      display: none;
    }
  }
`;

export default RegistryPage;
