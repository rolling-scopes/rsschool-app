import { Button, Checkbox, Col, DatePicker, Form, Icon, Input, Result, Row, Select, Typography } from 'antd';

import axios from 'axios';
import { Header } from 'components/Header';
import withCourses from 'components/withCourses';
import withSession from 'components/withSession';
import * as React from 'react';
import { UserService, UserFull } from 'services/user';

import { Course } from 'services/course';
import { formatMonthFriendly } from 'services/formatter';
import { Props, TYPES } from './../../configs/registry';
import { emailPattern, epamEmailPattern } from 'services/validators';
import { LocationSelect } from 'components/LocationSelect';

type State = {
  courses: Course[];
  submitted: boolean;
  initialData: Partial<UserFull>;
};

const defaultColumnSizes = {
  xs: 18,
  sm: 10,
  md: 8,
  lg: 6,
};
const defaultRowGutter = 24;

class CourseRegistryPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const courses = (this.props.courses || []).filter((course: Course) => course.planned);

    this.state = {
      courses,
      submitted: false,
      initialData: {} as any,
    };
  }

  async componentDidMount() {
    const userService = new UserService();
    const profile = await userService.getProfile();
    this.setState({ initialData: profile.user });
  }

  render() {
    const { courses, initialData } = this.state;
    const { getFieldDecorator: field, getFieldValue } = this.props.form;

    let content: React.ReactNode;
    if (!courses.length) {
      content = (
        <Result
          status="info"
          icon={<Icon type="meh" theme="twoTone" />}
          title="There are no planned courses."
          subTitle="Please come back later."
          extra={
            <Button type="primary" href="/">
              Back to Home
            </Button>
          }
        />
      );
    } else if (this.state.submitted) {
      content = <Result status="success" title="Your request has been submitted successfully." />;
    } else {
      const location = getFieldValue('location');
      const courseId = getFieldValue('courseId');
      const [description] = courses.filter(c => c.id === courseId).map(c => c.description);
      content = content = (
        <Form className="m-2" onSubmit={this.handleSubmit}>
          <Col offset={1}>
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
                <Form.Item label="First Name">
                  {field('firstName', {
                    initialValue: initialData.firstName,
                    rules: [{ required: true, message: 'First name is required' }],
                  })(<Input placeholder="Dzmitry" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Last Name">
                  {field('lastName', {
                    initialValue: initialData.lastName,
                    rules: [{ required: true, message: 'Last name is required' }],
                  })(<Input placeholder="Varabei" />)}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="How many students are you ready to mentor?">
                  {field('maxStudentsLimit', {
                    rules: [{ required: true, message: 'Please select students count' }],
                  })(
                    <Select placeholder="Select students count...">
                      <Select.Option value={2}>2</Select.Option>
                      <Select.Option value={3}>3</Select.Option>
                      <Select.Option value={4}>4</Select.Option>
                      <Select.Option value={5}>5</Select.Option>
                      <Select.Option value={6}>6</Select.Option>
                    </Select>,
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Location">
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
                  {field('primaryEmail', {
                    initialValue: initialData.primaryEmail,
                    rules: [{ required: true, pattern: emailPattern }],
                  })(<Input placeholder="user@example.com" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="EPAM Email (if applicable)">
                  {field('contactsEpamEmail', {
                    initialValue: initialData.contactsEpamEmail,
                    rules: [{ pattern: epamEmailPattern }],
                  })(<Input placeholder="first_last@epam.com" />)}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Typography.Title level={4}>Work Experience</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Title">{field('employmentTitle')(<Input />)}</Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Company">{field('employmentCompanyName')(<Input />)}</Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Period">
                  {field('employmentPeriod')(<DatePicker.RangePicker mode={['month', 'month']} />)}
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
              <Form.Item>{field('gdpr')(<Checkbox>I agree / Я согласен</Checkbox>)}</Form.Item>
            </Row>
            <Button size="large" type="primary" disabled={!getFieldValue('gdpr')} htmlType="submit">
              Submit
            </Button>
          </Col>
        </Form>
      );
    }

    return (
      <div>
        <Header username={this.props.session.githubId} />
        {content}
      </div>
    );
  }

  private handleSubmit = async (event: any) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, model: any) => {
      if (err) {
        return;
      }
      const { comment, location, courseId } = model;
      const registryModel = {
        courseId,
        comment,
        type: TYPES.MENTOR,
        maxStudentsLimit: model.maxStudentsLimit,
      };

      const userModel = {
        locationId: location.key ? location.key : undefined,
        locationName: !location.key ? model.otherLocationName : location.label,
        firstName: model.firstName,
        lastName: model.lastName,

        contactsEmail: model.contactsEmail,
        contactsEpamEmail: model.contactsEpamEmail,
        employmentHistory: [
          {
            companyName: model.employmentCompanyName,
            title: model.employmentTitle,
            dateFrom: model.dateFrom,
            dateTo: model.dateTo,
          },
        ],
      };

      const requests = [axios.post('/api/profile/registry', userModel), axios.post('/api/registry', registryModel)];

      try {
        await Promise.all(requests);
        this.setState({ submitted: true });
      } catch (e) {
        console.error(e);
      }
    });
  };
}

export default withCourses(withSession(Form.create()(CourseRegistryPage)));
