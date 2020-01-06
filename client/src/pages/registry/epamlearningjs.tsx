import { Button, Col, Form, Input, message, Result, Row, Typography } from 'antd';
import axios from 'axios';
import { LocationSelect, PageLayout } from 'components';
import { CommentInput, GdprCheckbox } from 'components/Forms';
import withSession from 'components/withSession';
import { useCallback, useState } from 'react';
import { useAsync, useUpdate } from 'react-use';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';
import { UserFull, UserService } from 'services/user';
import { emailPattern, englishNamePattern } from 'services/validators';
import { Props, TYPES } from './../../configs/registry';

const defaultColumnSizes = { xs: 18, sm: 10, md: 8, lg: 6 };
const textColumnSizes = { xs: 22, sm: 14, md: 12, lg: 10 };
const defaultRowGutter = 24;

const courseAlias = 'epamlearningjs';
const noticeStyle = {
  lineHeight: '20px',
  display: 'block',
  fontStyle: 'italic',
};

function Page(props: Props & { courseAlias?: string }) {
  const [form] = Form.useForm();

  const update = useUpdate();
  const [submitted, setSubmitted] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null as Course | null);
  const [initialData, setInitialData] = useState({} as Partial<UserFull>);

  useAsync(async () => {
    const userService = new UserService();
    const courseService = new CoursesService();
    const [profile, courses] = await Promise.all([userService.getProfile(), courseService.getCourses()]);
    const course = courses.find(course => course.alias === courseAlias) ?? null;

    setActiveCourse(course);
    setInitialData(profile.user);
  }, []);

  const handleSubmit = useCallback(async (model: any) => {
    const { comment, location } = model;
    const registryModel = {
      type: TYPES.STUDENT,
      courseId: activeCourse!.id,
      comment,
    };
    const userModel = {
      locationId: location.key ? location.key : undefined,
      locationName: !location.key ? model.otherLocationName : location.label,
      primaryEmail: model.primaryEmail,
      firstName: model.firstName,
      lastName: model.lastName,
    };

    try {
      const userResponse = await axios.post('/api/profile/registry', userModel);
      const githubId = userResponse && userResponse.data ? userResponse.data.data.githubId : '';
      if (githubId) {
        await axios.post('/api/registry', registryModel);
        setSubmitted(true);
      } else {
        message.error('Invalid github id');
      }
    } catch (e) {
      message.error('An error occured. Please try later.');
    }
  }, []);

  let content: React.ReactNode;
  const location = form.getFieldValue('location');
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
  } else {
    content = (
      <Form
        form={form}
        initialValues={getInitialValues(initialData)}
        onChange={update}
        className="m-2"
        onFinish={handleSubmit}
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
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please select city or "Other"' }]}
              >
                <span style={noticeStyle}>
                  We need your location for understanding audience and use it for mentor distribution. If you live close
                  to any city from the list, please choose it.
                </span>
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
                <span style={noticeStyle}>We will use your email only for course purposes. No spam emails.</span>
                <Input placeholder="user@example.com" />
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
              companies only for employment purposes.
            </Typography.Paragraph>
            <Typography.Paragraph>
              Я согласен на обработку моих персональных данных, содержащихся в приложении, и передачу их компаниям
              только в целях трудоустройства.
            </Typography.Paragraph>
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

function getInitialValues(initialData) {
  return {
    ...initialData,
    location: initialData.locationId ? { key: initialData.locationId } : undefined,
  };
}

export default withSession(Page);
