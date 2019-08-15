import { commentValidator, TextArea, UserSearchInput, UserSelect } from 'components/Forms';
import {} from 'components/Forms';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { Form, SubsetFormApi } from 'react-final-form';
import { Alert, Button, FormGroup } from 'reactstrap';
import { withRouter, NextRouter } from 'next/router';

import { UserService } from 'services/user';
import '../index.scss';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  user: { id: number; githubId: string } | null;
  isLoading: boolean;
  submitStatus: {
    success: boolean;
    message: string;
  } | null;
};

class PrivateFeedbackPage extends React.Component<Props, State> {
  state: State = {
    user: null,
    isLoading: false,
    submitStatus: null,
  };

  private timerRef: any;
  private userService = new UserService();

  componentDidMount() {
    const { router } = this.props;
    const githubId = router.query ? (router.query.githubId as string) : null;
    const userId = router.query ? (router.query.userId as string) : null;
    this.setState({
      user: githubId && userId ? { githubId, id: Number(userId) } : null,
    });
  }

  private loadUsers = async (searchText: string) => {
    return this.userService.search(searchText);
  };

  private handleSubmit = async (values: any, form: SubsetFormApi) => {
    this.setState({ isLoading: true });
    try {
      await this.userService.submitPrivateFeedback({
        toUserId: values.userId,
        comment: values.comment,
      });
      form.reset();
      const submitStatus = {
        success: true,
        message: `Your feedback has been submitted.`,
      };
      this.setState({ isLoading: false, submitStatus });
      this.timerRef = setTimeout(() => this.setState({ submitStatus: null }), 5000);
    } catch (e) {
      this.setState({ isLoading: false, submitStatus: { success: false, message: 'An error occurred' } });
    }
  };

  renderSubmitStatus() {
    if (!this.state.submitStatus) {
      return null;
    }
    return <Alert color={this.state.submitStatus.success ? 'info' : 'danger'}>{this.state.submitStatus.message}</Alert>;
  }

  componentWillUnmount() {
    clearTimeout(this.timerRef);
  }

  render() {
    return (
      <>
        <Header username={this.props.session.githubId} title="Private Feedback" />
        <div className="m-3">
          <Alert color="warning">Your feedback will be visible to course administrator/manager only</Alert>
          {this.renderSubmitStatus()}
          <Form
            initialValues={{ userId: this.state.user ? this.state.user.id : null }}
            onSubmit={this.handleSubmit}
            render={({ handleSubmit }) => (
              <LoadingScreen show={this.state.isLoading}>
                <form onSubmit={handleSubmit}>
                  <FormGroup className="col-md-6">
                    {this.state.user ? (
                      <UserSelect data={[this.state.user]} field="userId" />
                    ) : (
                      <UserSearchInput field="userId" searchUsers={this.loadUsers} />
                    )}
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <TextArea field="comment" label="Comment" validate={commentValidator(10)} />
                  </FormGroup>
                  <div className="form-group col-md-6 text-left">
                    <Button type="submit" color="success">
                      Submit
                    </Button>
                  </div>
                </form>
              </LoadingScreen>
            )}
          />
        </div>
      </>
    );
  }
}

export default withRouter(withSession(PrivateFeedbackPage));
