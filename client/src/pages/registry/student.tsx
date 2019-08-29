import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Result,
  Row,
  Select,
  Typography,
} from 'antd';
import axios from 'axios';
import { Header } from 'components/Header';
import withCourses from 'components/withCourses';
import withSession from 'components/withSession';
import * as React from 'react';
import { Course } from 'services/course';
import { UserService, UserFull } from 'services/user';
import { formatMonth, formatMonthFriendly } from 'services/formatter';
import { Props, TYPES } from './../../configs/registry';
import { emailPattern, epamEmailPattern, englishNamePattern } from 'services/validators';
import { LocationSelect } from 'components/LocationSelect';
import { NoCourses } from 'components/Registry/NoCourses';

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
    const courses = (props.courses || []).filter((course: Course) => course.planned);

    this.state = {
      courses,
      submitted: false,
      initialData: {},
    };
  }

  async componentDidMount() {
    const userService = new UserService();
    const profile = await userService.getProfile();
    this.setState({ initialData: profile.user });
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
      const [dateFrom, dateTo] = model.employmentPeriod;
      const userModel = {
        locationId: location.key ? location.key : undefined,
        locationName: !location.key ? model.otherLocationName : location.label,
        primaryEmail: model.primaryEmail,
        firstName: model.firstName,
        lastName: model.lastName,
        contactsEpamEmail: model.contactsEpamEmail,
        educationHistory: [
          {
            graduationYear: model.graduationYear,
            faculty: model.faculty,
            university: model.university,
          },
        ],
        employmentHistory: [
          {
            companyName: model.employmentCompanyName,
            title: model.employmentTitle,
            dateFrom: dateFrom ? formatMonth(dateFrom) : null,
            dateTo: dateTo ? formatMonth(dateTo) : null,
          },
        ],
      };

      try {
        const userResponse = await axios.post('/api/profile/registry', userModel);
        const githubId = userResponse && userResponse.data ? userResponse.data.data.githubId : '';

        if (githubId) {
          await axios.post('/api/registry', registryModel);
          this.setState({ submitted: true });
        } else {
          console.error('Invalid githubId');
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
    if (!courses.length) {
      content = <NoCourses />;
    } else if (this.state.submitted) {
      content = <Result status="success" title="Your request has been submitted successfully." />;
    } else {
      const courseId = getFieldValue('courseId');
      const [description] = courses.filter(c => c.id === courseId).map(c => c.description);
      content = (
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
                <Form.Item label="First Name (in English, as in passport)">
                  {field('firstName', {
                    initialValue: initialData.firstName,
                    rules: [
                      { required: true, message: 'First name is required' },
                      { pattern: englishNamePattern, message: 'First name should be in English' },
                    ],
                  })(<Input placeholder="Dzmitry" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Last Name (in English, as in passport)">
                  {field('lastName', {
                    initialValue: initialData.lastName,
                    rules: [
                      { required: true, message: 'Last name is required' },
                      { pattern: englishNamePattern, message: 'Last name should be in English' },
                    ],
                  })(<Input placeholder="Varabei" />)}
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
                    rules: [{ required: true, pattern: emailPattern, message: 'Email is required' }],
                  })(<Input placeholder="user@example.com" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="EPAM Email">
                  {field('contactsEpamEmail', { rules: [{ pattern: epamEmailPattern }] })(
                    <Input placeholder="first_last@epam.com" />,
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Typography.Title level={4}>Education</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="University / College / School">{field('university')(<Input />)}</Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Faculty">{field('faculty')(<Input />)}</Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Graduation Year">
                  {field('graduationYear')(<InputNumber min={1950} max={new Date().getUTCFullYear() + 10} />)}
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
                  {field('employmentPeriod', { initialValue: [null, null] })(
                    <DatePicker.RangePicker mode={['month', 'month']} />,
                  )}
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
      <>
        <Header courseName="Registration" username={this.props.session.githubId} />
        {content}
      </>
    );
  }
}

export default withCourses(withSession(Form.create()(CourseRegistryPage)));
