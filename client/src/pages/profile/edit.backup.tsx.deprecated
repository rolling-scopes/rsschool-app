import { Button, Col, Form, Input, message, Result, Row, Select, Typography } from 'antd';
import { PageLayout } from 'components';
import { LocationSelect } from 'components/LocationSelect';
import withSession, { Session } from 'components/withSession';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { TSHIRT_SIZES } from 'services/reference-data';
import { UserFull, UserService } from 'services/user';
import { emailPattern, englishNamePattern, epamEmailPattern, phonePattern } from 'services/validators';

type Props = { session: Session };

type ExternalAccount = { service: string; username: string };

const defaultColumnSizes = { xs: 18, sm: 11, md: 9, lg: 6 };
const defaultRowGutter = 24;

function Page(props: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(undefined as Partial<UserFull> | undefined | null);
  const userService = new UserService();

  useAsync(async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setInitialData(response.user);
    } catch (e) {
      setInitialData(null);
      message.error('Failed to load profile. Please try later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
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

      const user = await userService.updateUser(data);
      setInitialData(user);
      message.success('The profile has been updated.');
    } catch (e) {
      message.error('An error occured.');
    } finally {
      setLoading(false);
    }
  };

  if (initialData === undefined) {
    return <PageLayout loading={loading} githubId={props.session.githubId} />;
  }

  if (initialData === null) {
    return (
      <PageLayout loading={loading} githubId={props.session.githubId}>
        <Result status="403" title="No access or user does not exist" />
      </PageLayout>
    );
  }

  return (
    <PageLayout loading={loading} githubId={props.session.githubId}>
      <Form layout="vertical" form={form} initialValues={getInitialValues(initialData)} onFinish={handleSubmit}>
        <Row style={{ margin: 16 }}>
          <Col>
            <Typography.Title level={4}>General</Typography.Title>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="primaryEmail"
                  label="Primary Email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { pattern: emailPattern, message: 'Please enter a valid email' },
                  ]}
                >
                  <Input placeholder="user@example.com" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="firstName"
                  label="First Name (in English, as in passport)"
                  rules={[
                    { required: true, message: 'First name is required' },
                    { pattern: englishNamePattern, message: 'First name should be in English' },
                  ]}
                >
                  <Input placeholder="Dzmitry" />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="lastName"
                  label="Last Name (in English, as in passport)"
                  rules={[
                    { required: true, message: 'Last name is required' },
                    { pattern: englishNamePattern, message: 'Last name should be in English' },
                  ]}
                >
                  <Input placeholder="Varabei" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item name="englishLevel" label="Estimated English Level">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: 'Please select city or "Other"' }]}
                >
                  <LocationSelect placeholder="Select city" />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item name="otherLocationName" label="Other Location">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Typography.Title level={4}>Contacts</Typography.Title>
            <div>
              <Typography.Text type="warning">
                Your contacts will be shared with your mentor or students.
              </Typography.Text>
            </div>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="contactsEpamEmail"
                  label="EPAM Email (if applicable)"
                  rules={[{ message: 'Please enter a valid EPAM email', pattern: epamEmailPattern }]}
                >
                  <Input placeholder="first_last@epam.com" />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item name="contactsTelegram" label="Telegram">
                  <Input addonBefore="@" placeholder="durov" />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item name="contactsSkype" label="Skype">
                  <Input placeholder="johnsmith" />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item
                  name="contactsPhone"
                  label="Phone"
                  rules={[{ pattern: phonePattern, message: 'Please enter a valid phone' }]}
                >
                  <Input placeholder="+375297775533" />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item name="contactsNotes" label="Contact Notes">
                  <Input.TextArea placeholder="Any additional information how to contact you..." />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Typography.Title level={4}>Accounts</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item name="codeacademy" label="Codeacademy">
                  <Input />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item name="сodewars" label="Codewars">
                  <Input />
                </Form.Item>
              </Col>
              <Col {...defaultColumnSizes}>
                <Form.Item name="htmlacademy" label="HTML Academy">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Typography.Title level={4}>Other</Typography.Title>
            </Row>
            <Row gutter={defaultRowGutter}>
              <Col {...defaultColumnSizes}>
                <Form.Item name="tshirtSize" label="T-Shirt Size">
                  <Select>
                    {TSHIRT_SIZES.map(size => (
                      <Select.Option key={size.id} value={size.id}>
                        {size.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row justify="space-between" style={{ width: 250 }}>
              <Button style={{ width: 100 }} size="large" type="primary" htmlType="submit">
                Save
              </Button>
              <Button style={{ width: 100 }} size="large" href="/profile">
                Cancel
              </Button>
            </Row>
          </Col>
        </Row>
      </Form>
    </PageLayout>
  );
}

function getInitialValues(values: Partial<UserFull> | null) {
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
    location: { key: values.locationId },
  };
}

export default withSession(Page);
