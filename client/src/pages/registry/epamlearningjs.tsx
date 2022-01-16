import { Button, Col, Form, Input, message, Result, Row, Typography } from 'antd';
import axios from 'axios';
import { PageLayout } from 'components/PageLayout';
import { GdprCheckbox, LocationSelect } from 'components/Forms';
import withSession from 'components/withSession';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { useState, useEffect } from 'react';
import { useAsync, useUpdate } from 'react-use';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';
import { UserFull, UserService } from 'services/user';
import { emailPattern, englishNamePattern } from 'services/validators';
import { Props, TYPES } from './../../configs/registry';
import { Location } from 'common/models/profile';

const defaultColumnSizes = { xs: 18, sm: 10, md: 8, lg: 6 };
const defaultRowGutter = 24;

const courseAlias = 'epamlearningjs';

function Page(props: Props & { courseAlias?: string }) {
  const [form] = Form.useForm();

  const update = useUpdate();
  const [submitted, setSubmitted] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null as Course | null);
  const [location, setLocation] = useState(null as Location | null);
  const [initialData, setInitialData] = useState(null as Partial<UserFull> | null);

  useAsync(async () => {
    const userService = new UserService();
    const courseService = new CoursesService();
    const [profile, courses] = await Promise.all([userService.getMyProfile(), courseService.getCourses()]);
    const course = courses.find(course => course.alias === courseAlias) ?? null;
    setActiveCourse(course);
    setInitialData(profile);
  }, []);

  useEffect(() => {
    setLocation({
      countryName: initialData?.countryName,
      cityName: initialData?.cityName,
    } as Location);
  }, [initialData]);

  const handleSubmit = async (model: any) => {
    const { location } = model;
    const registryModel = {
      type: TYPES.STUDENT,
      courseId: activeCourse!.id,
    };
    const userModel = {
      cityName: location.cityName,
      countryName: location.countryName,
      primaryEmail: model.primaryEmail,
      firstName: model.firstName,
      lastName: model.lastName,
    };

    try {
      const userResponse = await axios.post<any>('/api/profile/me', userModel);
      const githubId = userResponse && userResponse.data ? userResponse.data.data.githubId : '';
      if (githubId) {
        await axios.post<any>('/api/registry', registryModel);
        setSubmitted(true);
      } else {
        message.error('Invalid github id');
      }
    } catch (e) {
      message.error('An error occured. Please try later.');
    }
  };

  let content: React.ReactNode;
  if (activeCourse == null) {
    return null;
  }
  if (submitted) {
    content = (
      <Result
        status="success"
        title="You have successfully registered."
        extra={
          <Button type="primary" href="/epamlearningjs">
            Continue
          </Button>
        }
      />
    );
  } else if (initialData) {
    content = (
      <Form
        layout="vertical"
        form={form}
        initialValues={getInitialValues(initialData)}
        onChange={update}
        className="m-2"
        onFinish={(values: any) => handleSubmit({ ...values, location })}
      >
        <Col style={{ margin: '0 20px' }}>
          <Row>
            <Typography.Title level={4}>My Profile</Typography.Title>
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
              <Form.Item
                help="We need your location for understanding audience and use it for mentor distribution."
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
              <Form.Item
                help="We will use your email only for course purposes. No spam emails."
                name="primaryEmail"
                label="Primary Email"
                rules={[{ required: true, pattern: emailPattern, message: 'Email is required' }]}
              >
                <Input placeholder="user@example.com" />
              </Form.Item>
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
    <PageLayout loading={false} title="Registration" githubId={props.session.githubId}>
      {content}
    </PageLayout>
  );
}

function getInitialValues({ countryName, cityName, ...initialData }: Partial<UserFull>) {
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
  };
}

export default withGoogleMaps(withSession(Page));
