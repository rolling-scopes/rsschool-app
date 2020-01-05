import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Button,
  Checkbox,
  Col,
  Input,
  message,
  Result,
  Row,
  Select,
  Spin,
  Tag,
  Typography,
} from 'antd';
import axios from 'axios';
import { GdprCheckbox } from 'components/Forms';
import { Header } from 'components/Header';
import { LocationSelect } from 'components/LocationSelect';
import withSession from 'components/withSession';
import { PureComponent } from 'react';
import { CoursesService } from 'services/courses';
import { formatMonthFriendly } from 'services/formatter';
import { UserFull, UserService } from 'services/user';
import { emailPattern, epamEmailPattern, phonePattern } from 'services/validators';
import { Course } from '../../../../common/models';
import { Props } from '../../configs/registry';

type State = {
  courses: Course[];
  submitted: boolean;
  isLoading: boolean;
  initialData: Partial<UserFull>;
};

const defaultColumnSizes = { xs: 18, sm: 12, md: 10, lg: 8 };
const textColumnSizes = { xs: 22, sm: 14, md: 12, lg: 10 };
const defaultRowGutter = 24;

class MentorRegistryPage extends PureComponent<Props, State> {
  readonly state: State = {
    courses: [],
    submitted: false,
    initialData: {} as any,
    isLoading: true,
  };

  async componentDidMount() {
    const [profile, allCourses] = await Promise.all([
      new UserService().getProfile(),
      new CoursesService().getCourses(),
    ]);

    const courses = allCourses
      .filter(course => !course.inviteOnly)
      .filter(course => course.planned || !course.completed);

    this.setState({ courses, initialData: profile.user, isLoading: false });
  }

  render() {
    const { courses, initialData, isLoading } = this.state;
    const { getFieldDecorator: field, getFieldValue } = this.props.form;

    let content: React.ReactNode;
    if (isLoading) {
      content = null;
    } else if (this.state.submitted) {
      content = <SuccessComponent />;
    } else {
      const location = getFieldValue('location');
      content = content = (
        <Row gutter={defaultRowGutter}>
          <Col lg={18}>
            <Form className="m-2" onSubmit={this.handleSubmit}>
              <Row style={{ marginBottom: 8 }}>
                <Typography.Title level={4}>О менторинге</Typography.Title>
                <Typography.Paragraph>
                  <ul>
                    <li>Темы менторинга: html/css/vanillajs.</li>
                    <li>
                      С вашей стороны требуется возможность уделять 4-8 часов в неделю или более (по вашему желанию).
                    </li>
                    <li>Можно менторить от 2 до 6 студентов.</li>
                    <li>Менторить можно удаленно.</li>
                  </ul>
                  <ul>
                    <b>Задачи ментора:</b>
                    <li>
                      Еженедельно встречаться с вашей группой студентов (можно в Skype, Google Hangouts, Gitter, Slack и
                      т.д.)
                    </li>
                    <li>Отвечать на вопросы студентов</li>
                    <li>Давать советы (code style, разбор заданий)</li>
                    <li>Проверять и оценивать работы студентов (~7 заданий)</li>
                    <li>Проводить учебные интервью (по 2 для каждого студента)</li>
                    <li>Проводить дополнительные лекции (по желанию)</li>
                  </ul>
                </Typography.Paragraph>
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
                  <Form.Item label="Prefered Courses">
                    {field('preferedCourses', { initialValue: [] })(
                      <Checkbox.Group
                        options={courses.map(c => ({
                          label: (
                            <>
                              {`${c.name} (Start: ${formatMonthFriendly(c.startDate)})`}{' '}
                              {c.planned ? <Tag color="orange">Planned</Tag> : <Tag color="green">In Progress</Tag>}
                            </>
                          ),
                          value: c.id,
                        }))}
                      />,
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={defaultRowGutter}>
                <Col {...defaultColumnSizes}>
                  <Form.Item label="How many students are you ready to mentor per course?">
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
                  <Form.Item label="Are you ready to mentor in ENGLISH?">
                    {field('englishMentoring', {
                      valuePropName: 'checked',
                      initialValue: false,
                    })(<Checkbox>Yes, I am ready</Checkbox>)}
                  </Form.Item>
                </Col>
                <Col {...defaultColumnSizes}>
                  <Form.Item label="Prefered students location">
                    {field('preferedStudentsLocation', {
                      rules: [{ required: true, message: 'Please select a prefered location option' }],
                    })(
                      <Select placeholder="Select a prefered option...">
                        <Select.Option value={'any'}>Any city or country</Select.Option>
                        <Select.Option value={'country'}>My country only</Select.Option>
                        <Select.Option value={'city'}>My city only</Select.Option>
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
                <GdprCheckbox field={field} />
              </Row>
              <Button
                size="large"
                type="primary"
                disabled={!getFieldValue('gdpr') || this.state.isLoading}
                htmlType="submit"
              >
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      );
    }

    return (
      <div>
        <Header username={this.props.session.githubId} />
        <Spin spinning={this.state.isLoading}>{content}</Spin>
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
      const {
        comment,
        location,
        preferedCourses,
        preferedStudentsLocation,
        maxStudentsLimit,
        englishMentoring,
      } = model;

      const registryModel = {
        comment,
        preferedCourses,
        maxStudentsLimit,
        englishMentoring,
        preferedStudentsLocation,
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

      try {
        await Promise.all([
          axios.post('/api/profile/registry', userModel),
          axios.post('/api/registry/mentor', registryModel),
        ]);
        this.setState({ submitted: true });
      } catch (e) {
        message.error('An error occured. Please try later.');
      } finally {
        this.setState({ isLoading: false });
      }
    });
  };
}

const SuccessComponent = () => {
  return (
    <Result
      status="info"
      title={
        <>
          <Row gutter={24} type="flex" justify="center">
            <Col xs={18} sm={16} md={12}>
              <p>Thanks a lot for registration!</p>
              <p>We will send you an email to the introduction meeting when the course is started. Stay tuned!</p>
              <p>
                Join our <a href="https://t.me/joinchat/HqpGRxNRANkGN2xx9bL8zQ">RSSchool Mentors FAQ</a> Telegram group.
              </p>
              <p>
                <Button type="primary" href="/">
                  Go to Home
                </Button>
              </p>
            </Col>
          </Row>
        </>
      }
    />
  );
};

export default withSession(Form.create()(MentorRegistryPage));
