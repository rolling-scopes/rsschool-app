import { Button, Checkbox, message, Col, Radio, Form, Icon, Input, Result, Row, Select, Typography } from 'antd';

import axios from 'axios';
import { Header } from 'components/Header';
import withCourses from 'components/withCourses';
import withSession from 'components/withSession';
import * as React from 'react';
import { UserService, UserFull } from 'services/user';

import { Course } from 'services/course';
import { formatMonthFriendly } from 'services/formatter';
import { Props, TYPES } from './../../configs/registry';
import { emailPattern, epamEmailPattern, phonePattern } from 'services/validators';
import { LocationSelect } from 'components/LocationSelect';
import { formatDateFriendly } from 'services/formatter';

type State = {
  courses: Course[];
  submitted: boolean;
  isLoading: boolean;
  initialData: Partial<UserFull>;
};

const defaultColumnSizes = { xs: 18, sm: 10, md: 8, lg: 6 };
const textColumnSizes = { xs: 22, sm: 14, md: 12, lg: 10 };
const defaultRowGutter = 24;

class CourseRegistryPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const courses = (this.props.courses || []).filter((course: Course) => course.planned);

    this.state = {
      courses,
      submitted: false,
      initialData: {} as any,
      isLoading: true,
    };
  }

  async componentDidMount() {
    const userService = new UserService();
    const profile = await userService.getProfile();
    this.setState({ initialData: profile.user, isLoading: false });
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
      content = (
        <Result
          status="success"
          title={
            <>
              <Row gutter={24} type="flex" justify="center">
                <Col xs={18} sm={16} md={12}>
                  <p>Thanks a lot for registration!</p>
                  <p>
                    We will review your request and send you an invintation to the introduction meeting when the course
                    is started. Stay tuned!
                  </p>
                  <p>
                    Join our <a href="https://t.me/joinchat/HqpGRxNRANkGN2xx9bL8zQ">RSSchool Mentors FAQ</a> Telegram
                    group.
                  </p>
                </Col>
              </Row>
            </>
          }
        />
      );
    } else {
      const location = getFieldValue('location');
      const courseId = getFieldValue('courseId');
      const [course] = courses.filter(c => c.id === courseId);
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
                {course && <Typography.Paragraph type="secondary">{course.description}</Typography.Paragraph>}
                {course && (
                  <Typography.Title level={4}>
                    Dates: {formatDateFriendly(course.startDate)} - {formatDateFriendly(course.endDate)}
                  </Typography.Title>
                )}
                <Typography.Paragraph>
                  <p>
                    <ul>
                      <li>Темы менторинга: html/css/vanillajs.</li>
                      <li>
                        С вашей стороны требуется возможность уделять 4-8 часов в неделю или более (по вашему желанию).
                      </li>
                      <li>Можно менторить от 2 до 6 студентов.</li>
                      <li>Менторить можно удаленно.</li>
                    </ul>
                  </p>
                  <p>
                    <ul>
                      <b>Задачи ментора:</b>
                      <li>
                        Еженедельно встречаться с вашей группой студентов (можно в Skype, Google Hangouts, Gitter, Slack
                        и т.д.)
                      </li>
                      <li>Отвечать на вопросы студентов</li>
                      <li>Давать советы (code style, разбор заданий)</li>
                      <li>Проверять и оценивать работы студентов (~7 заданий)</li>
                      <li>Проводить учебные интервью (по 2 для каждого студента)</li>
                      <li>Проводить дополнительные лекции (по желанию)</li>
                    </ul>
                  </p>
                </Typography.Paragraph>
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
                  <span
                    style={{
                      lineHeight: '20px',
                      display: 'block',
                      fontStyle: 'italic',
                    }}
                  >
                    Preferable to use Gmail because we use Google Drive for sharing
                  </span>
                  {field('primaryEmail', {
                    initialValue: initialData.primaryEmail,
                    rules: [{ required: true, pattern: emailPattern }],
                  })(<Input placeholder="user@example.com" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="EPAM Email (if applicable)">
                  <span
                    style={{
                      lineHeight: '20px',
                      display: 'block',
                      fontStyle: 'italic',
                    }}
                  >
                    If you are EPAM employee, please specify your email to avoid some manual processes later
                  </span>
                  {field('contactsEpamEmail', {
                    initialValue: initialData.contactsEpamEmail,
                    rules: [{ message: 'Please enter a valid EPAM email', pattern: epamEmailPattern }],
                  })(<Input placeholder="first_last@epam.com" />)}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="How many years of production experience do you have?">
                  {field('experienceInYears', {
                    rules: [{ required: true, message: 'Please specify your experience' }],
                  })(
                    <Radio.Group>
                      <Radio value="0-1">{`< 1 year`}</Radio>
                      <Radio value="1-2">{`< 2 years`}</Radio>
                      <Radio value="2-5">{`2-5 years`}</Radio>
                      <Radio value="5-10">{`> 5 years`}</Radio>
                    </Radio.Group>,
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={defaultRowGutter}>
              <Col {...textColumnSizes}>
                <Form.Item label="About Youself">
                  {field('aboutMyself', {
                    initialValue: initialData.aboutMyself,
                  })(<Input.TextArea placeholder="A couple words about yourself..." />)}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Typography.Title level={4}>Contacts</Typography.Title>
              <Typography.Text type="warning">Your contacts will be shared with your students.</Typography.Text>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Telegram">
                  {field('contactsTelegram', {
                    initialValue: initialData.contactsTelegram,
                  })(<Input addonBefore="@" placeholder="durov" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Skype">
                  {field('contactsSkype', {
                    initialValue: initialData.contactsSkype,
                  })(<Input placeholder="johnsmith" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Phone">
                  {field('contactsPhone', {
                    initialValue: initialData.contactsPhone,
                    rules: [{ pattern: phonePattern, message: 'Please enter a valid phone' }],
                  })(<Input placeholder="+375297775533" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Contact Notes">
                  {field('contactsNotes', {
                    initialValue: initialData.contactsNotes,
                  })(<Input.TextArea placeholder="Preferable time to contact, planned day offs etc." />)}
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
                companies only for students employment purposes.
              </Typography.Paragraph>
              <Typography.Paragraph>
                Я согласен на обработку моих персональных данных, содержащихся в приложении, и передачу их компаниям
                только в целях трудоустройства студентов.
              </Typography.Paragraph>
              <Form.Item>{field('gdpr')(<Checkbox>I agree / Я согласен</Checkbox>)}</Form.Item>
            </Row>
            <Button
              size="large"
              type="primary"
              disabled={!getFieldValue('gdpr') || this.state.isLoading}
              htmlType="submit"
            >
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
      this.setState({ isLoading: true });
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
        await Promise.all(requests);
        this.setState({ submitted: true });
      } catch (e) {
        message.error('An error occured. Please try later');
      } finally {
        this.setState({ isLoading: false });
      }
    });
  };
}

export default withCourses(withSession(Form.create()(CourseRegistryPage)));
