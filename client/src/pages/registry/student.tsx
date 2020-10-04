import { Button, Col, Form, Input, message, Result, Row, Select, Typography } from 'antd';
import axios from 'axios';
import { PageLayout, LocationSelect } from 'components';
import { CommentInput, GdprCheckbox } from 'components/Forms';
import { NoCourses } from 'components/Registry/NoCourses';
import withSession from 'components/withSession';
import { useCallback, useState, useEffect } from 'react';
import { useAsync, useUpdate } from 'react-use';
import { CoursesService } from 'services/courses';
import { formatMonthFriendly } from 'services/formatter';
import { Course } from 'services/models';
import { UserFull, UserService } from 'services/user';
import { emailPattern, englishNamePattern } from 'services/validators';
import { Props, TYPES } from './../../configs/registry';
import { NextPageContext } from 'next';
import { Location } from '../../../../common/models';

const defaultColumnSizes = { xs: 18, sm: 10, md: 8, lg: 6 };
const textColumnSizes = { xs: 22, sm: 14, md: 12, lg: 10 };
const defaultRowGutter = 24;

function Page(props: Props & { courseAlias?: string }) {
  const [form] = Form.useForm();
  const update = useUpdate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [courses, setCourses] = useState([] as Course[]);
  const [location, setLocation] = useState(null as Location | null);
  const [initialData, setInitialData] = useState({} as Partial<UserFull>);

  useAsync(async () => {
    setLoading(true);
    const userService = new UserService();
    const courseService = new CoursesService();
    const [profile, courses] = await Promise.all([userService.getMyProfile(), courseService.getCourses()]);
    const activeCourses = props.courseAlias
      ? courses.filter((course: Course) => course.alias === props.courseAlias)
      : courses.filter(isCourseOpenForRegistry).sort(sortByStartDate);

    setCourses(activeCourses);
    setInitialData(profile);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLocation({
      countryName: initialData.countryName,
      cityName: initialData.cityName,
    } as Location);
  }, [initialData]);

  const handleSubmit = useCallback(
    async (values: any) => {
      if (loading) {
        return;
      }
      setLoading(true);
      const { comment, courseId, location, primaryEmail, firstName, lastName } = values;
      const registryModel = { type: TYPES.STUDENT, courseId, comment };
      const userModel = {
        cityName: location.cityName,
        countryName: location.countryName,
        primaryEmail,
        firstName,
        lastName,
      };

      try {
        const userResponse = await axios.post('/api/profile/me', userModel);
        const githubId = userResponse && userResponse.data ? userResponse.data.data.githubId : '';
        if (githubId) {
          await axios.post('/api/registry', registryModel);
          setSubmitted(true);
        } else {
          message.error('Invalid github id');
        }
      } catch (e) {
        message.error('An error occured. Please try later.');
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  let content: React.ReactNode;
  if (loading) {
    content = undefined;
  } else if (!courses.length) {
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
    const courseId = form.getFieldValue('courseId');
    const [description] = courses.filter((c) => c.id === courseId).map((c) => c.description);
    content = (
      <Form
        layout="vertical"
        form={form}
        initialValues={getInitialValues(initialData, courses)}
        onChange={update}
        onFinish={(values: any) => handleSubmit({ ...values, location })}
      >
        <Col>
          <Row>
            <Typography.Title level={4}>Course</Typography.Title>
          </Row>
          <Row gutter={defaultRowGutter}>
            <Col xs={24} sm={20} md={16} lg={12} xl={10}>
              <Form.Item name="courseId">
                <Select placeholder="Select course...">
                  {courses.map((course) => (
                    <Select.Option key={course.id} value={course.id}>
                      {course.name} ({course.primarySkillName}, {formatMonthFriendly(course.startDate)})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
            </Col>
          </Row>
          <Row>
            <Typography.Title level={4}>General</Typography.Title>
          </Row>
          <Row gutter={defaultRowGutter}>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="firstName"
                label="First Name (in English, as in passport)"
                rules={[{ pattern: englishNamePattern, message: 'First name should be in English' }]}
              >
                <Input placeholder="Dzmitry" />
              </Form.Item>
            </Col>
            <Col {...defaultColumnSizes}>
              <Form.Item
                name="lastName"
                label="Last Name (in English, as in passport)"
                rules={[{ pattern: englishNamePattern, message: 'Last name should be in English' }]}
              >
                <Input placeholder="Varabei" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={defaultRowGutter}>
            <Col {...defaultColumnSizes}>
              <span>We will use your email only for course purposes. No spam emails.</span>
              <Form.Item
                name="primaryEmail"
                label="Primary Email"
                rules={[{ required: true, pattern: emailPattern, message: 'Email is required' }]}
              >
                <Input placeholder="user@example.com" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={defaultRowGutter}>
            <Col {...defaultColumnSizes}>
              <span>We need your location for understanding audience and use it for mentor distribution.</span>
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
            <Col {...textColumnSizes}>
              <CommentInput notRequired />
            </Col>
          </Row>
          <Row>
            <GdprCheckbox />
          </Row>
          <Button size="large" type="primary" disabled={!form.getFieldValue('gdpr')} htmlType="submit">
            Submit
          </Button>
        </Col>
      </Form>
    );
  }

  return (
    <PageLayout loading={loading} title="Registration" githubId={props.session.githubId}>
      {content}
    </PageLayout>
  );
}

function sortByStartDate(a: Course, b: Course) {
  return a.startDate.localeCompare(b.startDate);
}

function isCourseOpenForRegistry(course: Course) {
  // invite only courses do not open for public registration
  if (course.inviteOnly || course.completed) {
    return false;
  }
  if (course.planned) {
    return true;
  }
  if (course.registrationEndDate) {
    return new Date(course.registrationEndDate).getTime() > Date.now();
  }
  return false;
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

const RegistryStudentPage: any = withSession(Page);
RegistryStudentPage.getInitialProps = async (context: NextPageContext) => {
  try {
    const courseAlias = context.query.course;
    return { courseAlias };
  } catch (e) {
    console.error(e.message);
    return { courseAlias: undefined };
  }
};

export default RegistryStudentPage;
