import axios from 'axios';
import { UserSearchInput, TextArea, commentValidator } from 'components/Forms';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { Field, Form, FormRenderProps, SubsetFormApi } from 'react-final-form';
import { Alert, Button, FormGroup, Input, Label } from 'reactstrap';
import { Course } from 'services/course';
import { UserService } from 'services/user';
import '../../index.scss';

type Props = {
  session: Session;
  course: Course;
};

type Badge = {
  id: string;
  name: string;
};

type State = {
  badges: Badge[];
  submitStatus: {
    message: string;
    heroesUrl?: string;
    success: boolean;
  } | null;
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
    submitStatus: null,
  };

  private timerRef: any;
  private userService = new UserService();

  componentWillUnmount() {
    clearTimeout(this.timerRef);
  }

  render() {
    return (
      <>
        <Header title="#gratitude" username={this.props.session.githubId} courseName={this.props.course.name} />
        <div className="m-3">
          <Alert color="warning">
            Your feedback will be posted to #gratitude channel and to <a href="https://heroes.by">heroes.by</a> (if
            badge is selected)
          </Alert>
          {this.renderSubmitStatus()}
          <Form onSubmit={this.handleSubmit} render={this.renderForm} />
        </div>
      </>
    );
  }

  private loadUsers = async (searchText: string) => {
    return this.userService.search(searchText);
  };

  private handleSubmit = async (values: any, form: SubsetFormApi) => {
    this.setState({ isLoading: true });
    try {
      const result = await axios.post(`/api/course/${this.props.course.id}/feedback`, {
        toUserId: values.user.id,
        badgeId: values.badgeId,
        comment: values.comment,
      });
      form.reset();
      const submitStatus = {
        success: true,
        heroesUrl: result.data.data.heroesUrl,
        message: `Your feedback has been submitted.`,
      };
      this.setState({ isLoading: false, submitStatus });
      this.timerRef = setTimeout(() => this.setState({ submitStatus: null }), 5000);
    } catch (e) {
      this.setState({ isLoading: false, submitStatus: { success: false, message: 'An error occurred' } });
    }
  };

  private renderSubmitStatus() {
    if (!this.state.submitStatus) {
      return null;
    }
    return (
      <>
        <Alert color={this.state.submitStatus.success ? 'info' : 'danger'}>
          {this.state.submitStatus.message}
          <div>
            {this.state.submitStatus.heroesUrl && (
              <a href={this.state.submitStatus.heroesUrl}>{this.state.submitStatus.heroesUrl}</a>
            )}
          </div>
        </Alert>
      </>
    );
  }

  private renderForm = ({ handleSubmit }: FormRenderProps) => {
    return (
      <LoadingScreen show={this.state.isLoading}>
        <form onSubmit={handleSubmit}>
          <FormGroup className="col-md-6">
            <UserSearchInput searchUsers={this.loadUsers} />
          </FormGroup>
          <FormGroup className="col-md-6">
            <Field name="badgeId">
              {({ input }) => (
                <>
                  <Label>Badge</Label>
                  <Input {...input} type="select" placeholder="Badge">
                    <option value="">(Empty)</option>
                    {this.state.badges.map(badge => (
                      <option value={badge.id} key={badge.id}>
                        {badge.name}
                      </option>
                    ))}
                  </Input>
                </>
              )}
            </Field>
          </FormGroup>
          <FormGroup className="col-md-6">
            <TextArea field="comment" label="Comment" validate={commentValidator(20)} />
          </FormGroup>
          <div className="form-group col-md-6 text-left">
            <Button type="submit" color="success">
              Submit
            </Button>
          </div>
        </form>
      </LoadingScreen>
    );
  };
}

export default withCourseData(withSession(GratitudePage));
