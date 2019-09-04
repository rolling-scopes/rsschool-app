import { Button, Form, message, Typography, Col, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { Course, CourseService } from 'services/course';
import { UserService } from 'services/user';

type Props = {
  session: Session;
  course: Course;
} & FormComponentProps;

type Badge = {
  id: string;
  name: string;
};

type State = {
  badges: Badge[];
  isLoading: boolean;
};

const badges = [
  { id: 'Congratulations', name: 'Congratulations' },
  { id: 'Expert_help', name: 'Expert help' },
  { id: 'Great_speaker', name: 'Great speaker' },
  { id: 'Good_job', name: 'Good job' },
  { id: 'Helping_hand', name: 'Helping hand' },
  { id: 'Hero', name: 'Hero' },
  { id: 'Thank_you', name: 'Thank you' },
];

class GratitudePage extends React.Component<Props, State> {
  state: State = {
    badges,
    isLoading: false,
  };

  private userService = new UserService();
  private courseService = new CourseService();

  render() {
    const { getFieldDecorator: field } = this.props.form;
    return (
      <>
        <Header title="#gratitude" username={this.props.session.githubId} courseName={this.props.course.name} />
        <Col className="m-2" sm={12}>
          <Typography.Text type="secondary">Your feedback will be posted to #gratitude channel</Typography.Text>
          <LoadingScreen show={this.state.isLoading}>
            <Form onSubmit={this.handleSubmit}>
              <Form.Item label="Person">
                {field('userId', { rules: [{ required: true, message: 'Please select a person' }] })(
                  <UserSearch searchFn={this.loadUsers} />,
                )}
              </Form.Item>
              {/* <Form.Item label="Badge">
                {field('badgeId')(
                  <Select size="large" placeholder="Select a badge">
                    {this.state.badges.map(badge => (
                      <Select.Option key={badge.id} value={badge.id}>
                        {badge.name}
                      </Select.Option>
                    ))}
                  </Select>,
                )}
              </Form.Item> */}
              <Form.Item label="Comment">
                {field('comment', {
                  rules: [
                    {
                      required: true,
                      min: 20,
                      whitespace: true,
                      message: 'Please write more nice words about the person',
                    },
                  ],
                })(<Input.TextArea />)}
              </Form.Item>
              <Button size="large" type="primary" htmlType="submit">
                Submit
              </Button>
            </Form>
          </LoadingScreen>
        </Col>
      </>
    );
  }

  private loadUsers = async (searchText: string) => {
    return this.userService.searchUser(searchText);
  };

  private handleSubmit = async (e: any) => {
    e.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }

      try {
        this.setState({ isLoading: true });
        await this.courseService.postPublicFeedback(this.props.course.id, {
          toUserId: values.userId,
          // badgeId: values.badgeId,
          comment: values.comment,
        });
        this.props.form.resetFields();
        message.success('Your feedback has been submitted.');
        this.setState({ isLoading: false });
      } catch (e) {
        message.success('An error occured. Please try later.');
        this.setState({ isLoading: false });
      }
    });
  };
}

export default withCourseData(withSession(Form.create({ name: 'gratitude' })(GratitudePage)));
