import { Button, Checkbox, Col, Form, Input, message, Result, Row, Typography } from 'antd';
import axios from 'axios';
import { LocationSelect } from 'components/LocationSelect';
import withSession from 'components/withSession';
import * as React from 'react';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';

import { UserFull, UserService } from 'services/user';
import { emailPattern, englishNamePattern } from 'services/validators';
import { Props, TYPES } from '../../configs/registry';

type State = {
  course: Course | null;
  submitted: boolean;
  initialData: Partial<UserFull>;
};

const defaultColumnSizes = { xs: 18, sm: 10, md: 8, lg: 6 };
const defaultRowGutter = 24;

const courseAlias = 'epamlearningjs';

class CourseRegistryPage extends React.Component<Props, State> {
  state: State = {
    course: null,
    submitted: false,
    initialData: {},
  };

  async componentDidMount() {
    const userService = new UserService();
    const [profile, courses] = await Promise.all([userService.getProfile(), new CoursesService().getCourses()]);
    const activeCourse = courses.find(course => course.alias === courseAlias) ?? null;

    this.setState({ initialData: profile.user, course: activeCourse });
  }

  private handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, model: any) => {
      if (err || !this.state.course) {
        return;
      }
      const { location } = model;
      const registryModel = {
        type: TYPES.STUDENT,
        courseId: this.state.course.id,
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
    const { course, initialData } = this.state;
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    let content: React.ReactNode;
    const location = getFieldValue('location');
    if (course == null) {
      return null;
    }
    if (this.state.submitted) {
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
        <Row style={{ margin: 16 }}>
          <Form style={{ margin: 16 }} onSubmit={this.handleSubmit}>
            <Row>
              <Typography.Title level={4}>My Profile</Typography.Title>
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
          </Form>
        </Row>
      );
    }

    return content;
  }
}

export default withSession(Form.create()(CourseRegistryPage));
