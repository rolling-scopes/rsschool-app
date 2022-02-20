import { WarningOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Modal, Result, Row, Select, Typography } from 'antd';
import axios from 'axios';
import { Location } from 'common/models';
import { LocationSelect } from 'components/Forms';
import { RegistrationPageLayout } from 'components/RegistartionPageLayout';
import { Session } from 'components/withSession';
import { Info } from 'modules/Registry/components/Info';
import { NoCourses } from 'modules/Registry/components/NoCourses';
import { DEFAULT_ROW_GUTTER, TEXT_EMAIL_TOOLTIP, TEXT_LOCATION_STUDENT_TOOLTIP } from 'modules/Registry/constants';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useUpdate } from 'react-use';
import { formatMonthFriendly } from 'services/formatter';
import { Course } from 'services/models';
import { UserFull } from 'services/user';
import { emailPattern, englishNamePattern } from 'services/validators';
import css from 'styled-jsx/css';
import { useStudentCourseData } from '../../hooks/useStudentsCourseData';
import { CdnService } from 'services/cdn';
import { SolidarityUkraine } from 'components/SolidarityUkraine';

export const TYPES = {
  MENTOR: 'mentor',
  STUDENT: 'student',
};

export type Props = {
  courses?: Course[];
  session: Session;
};

const cdnService = new CdnService();

export function StudentRegistry(props: Props & { courseAlias?: string }) {
  const { githubId } = props.session;
  const [form] = Form.useForm();
  const update = useUpdate();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState(null as Location | null);

  const [loading, setLoading] = useState(false);

  const [student, studentLoading, registered] = useStudentCourseData(githubId, props.courseAlias);

  useEffect(() => {
    if (registered) {
      message.success('You are already registered to the course. Redirecting to Home page in 5 seconds...');
      setTimeout(() => router.push('/'), 5000);
    }
  }, [registered]);

  useEffect(() => {
    setLocation({
      countryName: student?.profile.countryName,
      cityName: student?.profile.cityName,
    } as Location);
  }, [student?.profile]);

  const handleSubmit = useCallback(
    async (values: any) => {
      if (loading || studentLoading) {
        return;
      }

      const { courseId, location, primaryEmail, firstName, lastName } = values;
      const registryModel = { type: TYPES.STUDENT, courseId };
      const userModel = {
        cityName: location.cityName,
        countryName: location.countryName,
        primaryEmail,
        firstName,
        lastName,
      };

      if (student?.registeredForCourses.length) {
        Modal.confirm({
          icon: <WarningOutlined style={{ color: 'red', fontWeight: 700, fontSize: 24 }} />,
          title: <h3 style={{ fontWeight: 700, textAlign: 'center' }}>Course registration warning</h3>,
          content: (
            <div style={{ fontWeight: 500, fontSize: 15 }}>
              You are already registered for the following courses:
              <ul>
                {student?.registeredForCourses.map(({ name }) => (
                  <li key={name}>{`${name}`}</li>
                ))}
              </ul>
              <span style={{ fontWeight: 700, fontSize: 16, backgroundColor: 'yellow' }}>NOTE:</span>
              <span style={{ fontWeight: 700 }}>
                {' '}
                We do not recommend studying at several courses at the same time.
              </span>
            </div>
          ),
          centered: true,
          onOk: async () => {
            await confirmRegistration();
          },
          okText: 'Registration',
          cancelText: 'Return',
          maskClosable: true,
        });
      } else {
        await confirmRegistration();
      }

      async function confirmRegistration() {
        setLoading(true);
        try {
          const userResponse = await axios.post<any>('/api/profile/me', userModel);
          const githubId = userResponse && userResponse.data ? userResponse.data.data.githubId : '';
          if (githubId) {
            await cdnService.registerStudent(registryModel);
            setSubmitted(true);
          } else {
            message.error('Invalid github id');
          }
        } catch (e) {
          message.error('An error occured. Please try later.');
        } finally {
          setLoading(false);
        }
      }
    },
    [loading, studentLoading],
  );

  let content: React.ReactNode;
  if (loading || studentLoading || registered) {
    content = undefined;
  } else if (!student?.courses.length) {
    content = <NoCourses />;
  } else if (submitted) {
    content = (
      <Result
        status="success"
        title="You have successfully registered."
        extra={
          <Button type="primary" href="/">
            Go to Home
          </Button>
        }
      />
    );
  } else {
    content = (
      <Form
        layout="vertical"
        style={{ margin: '10px', height: '100%' }}
        form={form}
        initialValues={getInitialValues(student?.profile, student?.courses)}
        onChange={update}
        onFinish={(values: any) =>
          handleSubmit({ ...values, location, registeredForCourses: student?.registeredForCourses })
        }
      >
        <div className="student-registration">
          <div className="student-registration-slide">
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
          <div className="student-registration-content">
            <Col>
              <SolidarityUkraine />
              <Row>
                <Typography.Title level={3} style={{ margin: '8px 0 40px' }}>
                  Welcome to RS School!
                </Typography.Title>
              </Row>
              <Row>
                <Typography.Title level={5}>Course</Typography.Title>
              </Row>
              <Row gutter={DEFAULT_ROW_GUTTER}>
                <Col xs={24} sm={24} md={20} lg={20} xl={20}>
                  <Form.Item name="courseId">
                    <Select placeholder="Select course...">
                      {student?.courses.map(course => (
                        <Select.Option key={course.id} value={course.id}>
                          {course.name} ({course.primarySkillName}, {formatMonthFriendly(course.startDate)})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={DEFAULT_ROW_GUTTER}>
                <Col xs={24} sm={12} md={10} lg={10} xl={10} style={{ marginBottom: 24 }}>
                  <Row>
                    <Typography.Title level={5}>First Name</Typography.Title>
                  </Row>
                  <Row>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item
                        name="firstName"
                        style={{ marginBottom: '0' }}
                        rules={[{ pattern: englishNamePattern, message: 'First name should be in English' }]}
                      >
                        <Input placeholder="Dzmitry" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <span className="descriptions-name">In English, as in passport</span>
                </Col>
                <Col xs={24} sm={12} md={10} lg={10} xl={10} style={{ marginBottom: 24 }}>
                  <Row>
                    <Typography.Title level={5}>Last Name</Typography.Title>
                  </Row>
                  <Row>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item
                        name="lastName"
                        style={{ marginBottom: '0' }}
                        rules={[{ pattern: englishNamePattern, message: 'Last name should be in English' }]}
                      >
                        <Input placeholder="Varabei" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <span className="descriptions-name last">In English, as in passport</span>
                </Col>
              </Row>
              <Row gutter={DEFAULT_ROW_GUTTER}>
                <Col xs={24} sm={24} md={20} lg={20} xl={20}>
                  <Row>
                    <Typography.Title level={5}>
                      City <Info title={TEXT_LOCATION_STUDENT_TOOLTIP} />
                    </Typography.Title>
                  </Row>
                  <Row>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
              <Row gutter={DEFAULT_ROW_GUTTER}>
                <Col xs={24} sm={24} md={20} lg={20} xl={20} style={{ marginBottom: 16 }}>
                  <Row>
                    <Typography.Title level={5}>
                      E-mail <Info title={TEXT_EMAIL_TOOLTIP} />
                    </Typography.Title>
                  </Row>
                  <Row>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
              <Row gutter={DEFAULT_ROW_GUTTER}>
                <Col xs={24} sm={24} md={20} lg={20} xl={20}>
                  <span>
                    Pushing the button I agree with the processing my personal data, contained in the application, and
                    sharing it with companies only for students employment purposes.
                  </span>
                </Col>
              </Row>
              <Row>
                <Button size="large" type="primary" htmlType="submit" style={{ marginTop: 16 }}>
                  Submit
                </Button>
              </Row>
            </Col>
          </div>
        </div>
        <style jsx>{styles}</style>
      </Form>
    );
  }

  return (
    <RegistrationPageLayout loading={loading || studentLoading} githubId={props.session.githubId}>
      {content}
    </RegistrationPageLayout>
  );
}

function getInitialValues({ countryName, cityName, ...initialData }: Partial<UserFull>, courses: Course[]) {
  const location =
    countryName &&
    cityName &&
    ({
      countryName,
      cityName,
    } as Location | null);
  return {
    ...initialData,
    courseId: courses[0].id,
    location,
  };
}

const styles = css`
  .student-registration {
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
  .student-registration-slide {
    background-color: #141414;
    width: 350px;
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
  .student-registration-content {
    padding: 32px 10px 80px 24px;
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
  @media (max-width: 768px) {
    .student-registration-content {
      padding: 32px 24px 80px 24px;
    }
    .student-registration-slide {
      background-color: #141414;
      width: 220px;
    }
  }
  @media (max-width: 575px) {
    .student-registration {
      flex-direction: column;
    }
    .student-registration-slide {
      background-color: #141414;
      width: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
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
  }
`;
