import * as React from 'react';
import { Row, Col, Result, Form, Input, Typography, Button, message, Select } from 'antd';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import { UserService, UserFull } from 'services/user';
import { emailPattern, phonePattern, englishNamePattern, epamEmailPattern } from 'services/validators';
import { LocationSelect } from 'components/LocationSelect';
import { TSHIRT_SIZES } from 'services/reference-data';

type Props = { session: Session; }

type State = {
  isLoading: boolean;
  initialData: Partial<UserFull> | null;
};

type ExternalAccount = {
  service: string;
  username: string;
};

const defaultColumnSizes = {
  xs: 18,
  sm: 11,
  md: 9,
  lg: 6,
};
const defaultRowGutter = 24;

class EditProfilePage extends React.Component<Props, State> {
  state: State = {
    isLoading: true,
    initialData: {},
  };

  private userService = new UserService();

  private fetchData = async () => {
    this.setState({ isLoading: true });

    try {
      const response = await this.userService.getProfile();

      this.setState({ isLoading: false, initialData: response.user });
    } catch (e) {
      this.setState({ isLoading: false, initialData: null });
    }
  };

  async componentDidMount() {
    await this.fetchData();
  }

  private handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      try {
        this.setState({ isLoading: true });
        const externalAccounts: ExternalAccount[] = [];
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
        const { location } = values;
        const data: Partial<UserFull> = {
          locationId: location.key ? location.key : undefined,
          locationName: !location.key ? values.otherLocationName : location.label,
          firstName: values.firstName,
          lastName: values.lastName,
          englishLevel: values.englishLevel,
          contactsTelegram: values.contactsTelegram,
          contactsSkype: values.contactsSkype,
          contactsPhone: values.contactsPhone,
          contactsNotes: values.contactsNotes,
          primaryEmail: values.primaryEmail,
          contactsEpamEmail: values.contactsEpamEmail,
          tshirtSize: values.tshirtSize,
          externalAccounts,
        };

        const user = await this.userService.updateUser(data);
        this.setState({ isLoading: false, initialData: user });
        message.success('The profile has been updated.');
      } catch (e) {
        message.error('An error occured.');
        this.setState({ isLoading: false });
      }
    });
  };

  private getInitialValues = (values: UserFull | null) => {
    if (values == null) {
      return {};
    }
    const externalAccounts = values.externalAccounts || [];
    const codewars = externalAccounts.find((i: any) => i.service === 'codewars');
    const codeacademy = externalAccounts.find((i: any) => i.service === 'codeacademy');
    const htmlacademy = externalAccounts.find((i: any) => i.service === 'htmlacademy');
    return {
      codeacademy: codeacademy ? codeacademy.username : '',
      codewars: codewars ? codewars.username : '',
      contactsEpamEmail: values.contactsEpamEmail,
      contactsPhone: values.contactsPhone,
      contactsSkype: values.contactsSkype,
      contactsTelegram: values.contactsTelegram,
      contactsNotes: values.contactsNotes,
      firstName: values.firstName,
      htmlacademy: htmlacademy ? htmlacademy.username : '',
      lastName: values.lastName,
      locationId: values.locationId,
      locationName: values.locationName,
      englishLevel: values.englishLevel,
      primaryEmail: values.primaryEmail,
      tshirtSize: values.tshirtSize,
    };
  };

  renderProfile() {
    if (!this.state.initialData) {
      return (
        <>
          <Header username={this.props.session.githubId} />
          <Result status="403" title="No access or user does not exist" />
        </>
      );
    }
    const initialData = this.getInitialValues(this.state.initialData as UserFull);
    const { getFieldDecorator: field } = this.props.form;
    return (
      <>
        <Header username={this.props.session.githubId} />
        <Form className="m-2" onSubmit={this.handleSubmit}>
          <Col offset={1}>
            <Row>
              <Typography.Title level={4}>General</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Primary Email">
                  {field('primaryEmail', {
                    initialValue: initialData.primaryEmail,
                    rules: [
                      { required: true, message: 'Email is required' },
                      { pattern: emailPattern, message: 'Please enter a valid email' },
                    ],
                  })(<Input placeholder="user@example.com" />)}
                </Form.Item>
              </Col>
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
                <Form.Item label="Estimated English Level">
                  {field('englishLevel', {
                    initialValue: initialData.englishLevel,
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Location">
                  {field('location', {
                    initialValue: { key: initialData.locationId },
                    rules: [{ required: true, message: 'Please select city or "Other"' }],
                  })(<LocationSelect placeholder="Select city" />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Other Location">{field('otherLocationName')(<Input />)}</Form.Item>
              </Col>
            </Row>
            <Row>
              <Typography.Title level={4}>Contacts</Typography.Title>
              <Typography.Text type="warning">
                Your contacts will be shared with your mentor or students.
              </Typography.Text>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="EPAM Email (if applicable)">
                  {field('contactsEpamEmail', {
                    initialValue: initialData.contactsEpamEmail,
                    rules: [{ message: 'Please enter a valid EPAM email', pattern: epamEmailPattern }],
                  })(<Input placeholder="first_last@epam.com" />)}
                </Form.Item>
              </Col>
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
              <Col {...defaultColumnSizes}>
                <Form.Item label="Contact Notes">
                  {field('contactsNotes', {
                    initialValue: initialData.contactsNotes,
                  })(<Input.TextArea placeholder="Any additional information how to contact you..." />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Typography.Title level={4}>Accounts</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Codeacademy">
                  {field('codeacademy', {
                    initialValue: initialData.codeacademy,
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="Codewars">
                  {field('codewars', {
                    initialValue: initialData.codewars,
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item label="HTML Academy">
                  {field('htmlacademy', {
                    initialValue: initialData.htmlacademy,
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Typography.Title level={4}>Other</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item label="T-Shirt Size">
                  {field('tshirtSize', {
                    initialValue: initialData.tshirtSize,
                  })(
                    <Select>
                      {TSHIRT_SIZES.map(size => (
                        <Select.Option key={size.id} value={size.id}>
                          {size.name}
                        </Select.Option>
                      ))}
                    </Select>,
                  )}
                </Form.Item>
              </Col>
            </Row>
            <div className="mb-5">
              <Button className="mr-3" style={{ width: 100 }} size="large" type="primary" htmlType="submit">
                Save
              </Button>
              <Button style={{ width: 100 }} size="large" href="/profile">
                Cancel
              </Button>
            </div>
          </Col>
        </Form>
      </>
    );
  }

  render() {
    return <LoadingScreen show={this.state.isLoading}>{this.renderProfile()}</LoadingScreen>;
  }
}

export default withSession(EditProfilePage);
