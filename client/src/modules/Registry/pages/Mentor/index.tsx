import { Button, Steps, Col, Form, message, Result, Row, Typography } from 'antd';
import { HeartTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { useCallback, useState, useEffect } from 'react';
import { useAsync, useUpdate } from 'react-use';
import css from 'styled-jsx/css';
import { RegistrationPageLayout } from 'components/RegistartionPageLayout';
import { Session } from 'components/withSession';
import { CoursesService } from 'services/courses';
import { UserFull, UserService } from 'services/user';
import type { Course } from 'services/models';
import { Location } from 'common/models';
import { DEFAULT_COLUMN_SIZES, DEFAULT_ROW_GUTTER, RSSCHOOL_BOT_LINK } from 'modules/Registry/constants';
import { GeneralMentor, Mentorship } from 'modules/Registry/components';

export type Props = {
  courses?: Course[];
  session: Session;
};

export function MentorRegistry(props: Props & { courseAlias?: string }) {
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
          .filter(course => (course.planned || !course.completed) && !course.inviteOnly && course.personalMentoring)
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
  }, [initialData, checkedList]);

  const handleSubmit = useCallback(
    async (model: any) => {
      const data = { ...resume, ...model };
      setResume(data);
      if (!currentStep) {
        setCurrentSteps(currentStep + 1);
      } else {
        setLoading(true);
        const {
          technicalMentoring,
          preferedCourses,
          preferedStudentsLocation,
          maxStudentsLimit,
          languagesMentoring,
          location,
        } = data;

        const registryModel = {
          preferedCourses,
          maxStudentsLimit,
          preferedStudentsLocation,
          languagesMentoring,
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

        const requests = [
          axios.post<any>('/api/profile/me', userModel),
          axios.post<any>('/api/registry/mentor', registryModel),
        ];

        try {
          await Promise.all(requests);
          setSubmitted(true);
        } catch (e) {
          message.error('An error occured. Please try later');
        } finally {
          setLoading(false);
        }
      }
    },
    [resume, currentStep],
  );

  const prev = () => {
    if (!currentStep) {
      setStartPage(true);
    } else {
      setCurrentSteps(currentStep - 1);
    }
  };

  const getContentGeneral = () => (
    <GeneralMentor
      courses={courses}
      checkedList={checkedList}
      location={location}
      isAvailableContact={isAvailableContact}
      setIsAvailableContact={setIsAvailableContact}
      setLocation={setLocation}
    />
  );

  const getContentMentorship = () => <Mentorship checkedList={checkedList} />;

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

              <Row gutter={DEFAULT_ROW_GUTTER}>
                <Col {...DEFAULT_COLUMN_SIZES}>
                  <Typography.Paragraph style={{ fontSize: 14, marginBottom: 32, marginTop: 15 }}>
                    You are required to mentor students (from 2 to 6) and coach them 4-8 hours a week (or more, if you
                    wish). Mentoring topics - html/css/vanillajs. You can teach them remotely.
                  </Typography.Paragraph>
                </Col>
              </Row>

              <Row>
                <Typography.Title level={4}>Responsibilities:</Typography.Title>
              </Row>

              <Row gutter={DEFAULT_ROW_GUTTER}>
                <Col {...DEFAULT_COLUMN_SIZES}>
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
          Subscribe to our <a href={RSSCHOOL_BOT_LINK}>Telegram-bot</a>. Before the start of the course, it will send
          you the message to confirm your participation in the course and provide the next steps.
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
