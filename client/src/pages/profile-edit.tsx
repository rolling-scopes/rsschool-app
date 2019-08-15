import * as React from 'react';
import { Form } from 'react-final-form';
import { Button, FormGroup } from 'reactstrap';
import axios from 'axios';
import { withRouter, NextRouter } from 'next/router';

import { TextInput } from 'components/Forms';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';

import '../index.scss';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  profile: any;
  isLoading: boolean;
};

class EditProfilePage extends React.Component<Props, State> {
  state: State = {
    isLoading: true,
    profile: null,
  };

  constructor(props: Readonly<Props>) {
    super(props);
    this.fetchData = this.fetchData.bind(this);
  }

  async fetchData() {
    this.setState({ isLoading: true });

    try {
      const response = await axios.get(`api/profile/me`);

      const profile = response.data.data;
      this.setState({ isLoading: false, profile });
    } catch (e) {
      this.setState({ isLoading: false, profile: null });
    }
  }

  async componentDidMount() {
    await this.fetchData();
  }

  private handleSubmit = async (values: any) => {
    try {
      this.setState({ isLoading: true });
      const externalAccounts = [];
      if (values.codewars) {
        externalAccounts.push({
          service: 'codewars',
          username: values.codewars,
        });
      }
      if (values.codeacademy) {
        externalAccounts.push({
          service: 'codeacademy',
          username: values.codeacademy,
        });
      }
      if (values.htmlacademy) {
        externalAccounts.push({
          service: 'htmlacademy',
          username: values.htmlacademy,
        });
      }
      const data = {
        firstName: values.firstName,
        lastName: values.lastName,
        firstNameNative: values.firstNameNative,
        lastNameNative: values.lastNameNative,
        externalAccounts,
      };

      const response = await axios.post(`api/profile/me`, data);
      const profile = response.data.data;

      this.setState({ isLoading: false, profile });
    } catch (e) {
      this.setState({ isLoading: false });
    }
  };

  private getInitialValues = (profile: any) => {
    const codewars = profile.externalAccounts.find((i: any) => i.service === 'codewars');
    const codeacademy = profile.externalAccounts.find((i: any) => i.service === 'codeacademy');
    const htmlacademy = profile.externalAccounts.find((i: any) => i.service === 'htmlacademy');
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      firstNameNative: profile.firstNameNative,
      lastNameNative: profile.lastNameNative,
      codewars: codewars ? codewars.username : '',
      codeacademy: codeacademy ? codeacademy.username : '',
      htmlacademy: htmlacademy ? htmlacademy.username : '',
    };
  };

  renderProfile() {
    if (!this.state.profile) {
      return (
        <div>
          <Header username={this.props.session.githubId} />
          <h2 className="m-4">No Access</h2>
        </div>
      );
    }
    const { profile } = this.state;

    return (
      <>
        <Header username={this.props.session.githubId} />
        <div className="profile_container">
          <Form
            onSubmit={this.handleSubmit}
            initialValues={this.getInitialValues(profile)}
            render={({ handleSubmit }) => (
              <LoadingScreen show={this.state.isLoading}>
                <form onSubmit={handleSubmit}>
                  <FormGroup className="col-md-6">
                    <TextInput field="firstName" label="First Name" required />
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <TextInput field="lastName" label="Last Name" required />
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <TextInput field="firstNameNative" label="First Name Native" required />
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <TextInput field="lastNameNative" label="Last Name Native" required />
                  </FormGroup>

                  <FormGroup className="col-md-6">
                    <TextInput field="codewars" label="Codewars Username" />
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <TextInput field="htmlacademy" label="HTML Academy Username" />
                  </FormGroup>

                  <FormGroup className="col-md-6">
                    <TextInput field="сodeacademy" label="Codeacademy Username" />
                  </FormGroup>

                  <div className="row text-center">
                    <div className="form-group col-md-6 d-flex justify-content-between">
                      <Button onClick={() => this.props.router.push('/profile')} color="secondary">
                        Back to Profile
                      </Button>
                      <Button type="submit" color="success">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </form>
              </LoadingScreen>
            )}
          />
        </div>
      </>
    );
  }

  render() {
    return <LoadingScreen show={this.state.isLoading}>{this.renderProfile()}</LoadingScreen>;
  }
}

export default withRouter(withSession(EditProfilePage));
