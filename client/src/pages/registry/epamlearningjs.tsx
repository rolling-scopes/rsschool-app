import { Button, Checkbox, Col, Form, Input, message, Result, Row, Select, Typography } from 'antd';
import axios from 'axios';
import withSession from 'components/withSession';
import * as React from 'react';
import { Course, CourseService } from 'services/course';
import { UserService, UserFull } from 'services/user';
import { formatMonthFriendly } from 'services/formatter';
import { Props, TYPES } from '../../configs/registry';
import { emailPattern, englishNamePattern } from 'services/validators';
import { LocationSelect } from 'components/LocationSelect';
import { NoCourses } from 'components/Registry/NoCourses';

type State = {
  courses: Course[] | null;
  submitted: boolean;
  initialData: Partial<UserFull>;
};

const defaultColumnSizes = { xs: 18, sm: 10, md: 8, lg: 6 };
const textColumnSizes = { xs: 22, sm: 14, md: 12, lg: 10 };
const defaultRowGutter = 24;

const noticeStyle = {
  lineHeight: '20px',
  display: 'block',
  fontStyle: 'italic',
};

const courseAlias = 'epamlearningjs';

class CourseRegistryPage extends React.Component<Props, State> {
  state: State = {
    courses: null,
    submitted: false,
    initialData: {},
  };

  async componentDidMount() {
    const userService = new UserService();
    const courseService = new CourseService();
    const [profile, courses] = await Promise.all([userService.getProfile(), courseService.getCourses()]);
    const activeCourses = courses.filter((course: Course) => course.alias === courseAlias);

    this.setState({
      initialData: profile.user,
      courses: activeCourses,
    });
  }

  private handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, model: any) => {
      if (err) {
        return;
      }
      const { comment, location, courseId } = model;
      const registryModel = {
        type: TYPES.STUDENT,
        courseId,
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
        const githubId = userResponse.data?.data?.githubId ?? '';

        if (githubId) {
          await axios.post('/api/registry', registryModel);
          this.setState({ submitted: true });
        } else {
          message.error('Invalid github id');
        }
      } catch (e) {
        message.error('An error occured. Please try later.');
      }
    });
  };

  render() {
    const { courses, initialData } = this.state;
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    let content: React.ReactNode;
    const location = getFieldValue('location');
    if (courses == null) {
      return null;
    }
    if (!courses.length) {
      content = <NoCourses />;
    } else if (this.state.submitted) {
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
      const courseId = getFieldValue('courseId');
      const [description] = courses.filter(c => c.id === courseId).map(c => c.description);
      content = (
        <Form style={{ margin: 16 }} onSubmit={this.handleSubmit}>
          <Col style={{ margin: '0 20px' }}>
            <Row>
              <Typography.Title level={4}>Course</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col span={10}>
                <Form.Item>
                  {field('courseId', { initialValue: courses[0].id })(
                    <Select placeholder="Select course...">
                      {courses.map(course => (
                        <Select.Option key={course.id} value={course.id}>
                          {course.name} ({course.primarySkillName}, {formatMonthFriendly(course.startDate)})
                        </Select.Option>
                      ))}
                    </Select>,
                  )}
                </Form.Item>
                <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
              </Col>
            </Row>
            <Row>
              <Typography.Title level={4}>General</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="First Name (in English, as in passport)">
                  {field('firstName', {
                    initialValue: initialData.firstName,
                    rules: [{ pattern: englishNamePattern, message: 'First name should be in English' }],
                  })(<Input placeholder="Dzmitry" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Last Name (in English, as in passport)">
                  {field('lastName', {
                    initialValue: initialData.lastName,
                    rules: [{ pattern: englishNamePattern, message: 'Last name should be in English' }],
                  })(<Input placeholder="Varabei" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Location">
                  <span style={noticeStyle}>
                    We need your location for understanding audience and use it for mentor distribution. If you live
                    close to any city from the list, please choose it.
                  </span>
                  {field('location', {
                    initialValue: initialData.locationId ? { key: initialData.locationId } : undefined,
                    rules: [{ required: true, message: 'Please select city or "Other"' }],
                  })(<LocationSelect placeholder="Select city" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Other Location">
                  {field('otherLocationName', {
                    rules: [{ required: location && !location.key, message: 'Location name is required' }],
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Primary Email">
                  <span style={noticeStyle}>We will use your email only for course purposes. No spam emails.</span>
                  {field('primaryEmail', {
                    initialValue: initialData.primaryEmail,
                    rules: [{ required: true, pattern: emailPattern, message: 'Email is required' }],
                  })(<Input placeholder="user@example.com" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...textColumnSizes}>
                <Form.Item label="Comments / Feedback / Questions">
                  {field('comment', {})(<Input.TextArea placeholder="" />)}
                </Form.Item>
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
              <Form.Item>
                {field('gdpr', { valuePropName: 'checked' })(<Checkbox>I agree / Я согласен</Checkbox>)}
              </Form.Item>
            </Row>
            <Button size="large" type="primary" disabled={!getFieldValue('gdpr')} htmlType="submit">
              Submit
            </Button>
          </Col>
        </Form>
      );
    }

    return content;
  }
}

export default withSession(Form.create()(CourseRegistryPage));
