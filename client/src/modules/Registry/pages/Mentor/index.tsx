import { Col, Form, Row, Space, Steps, Typography } from 'antd';
import { useUpdate } from 'react-use';
import { RegistrationPageLayout } from 'components/RegistartionPageLayout';
import { Session } from 'components/withSession';
import { Footer } from 'modules/Registry/components';
import type { Course } from 'services/models';
import { useMentorData, useFormProps } from 'modules/Registry/hooks';

export type Props = {
  courses?: Course[];
  session: Session;
};

const { Step } = Steps;
const { Title, Text } = Typography;

const formItemLayout = {
  labelCol: {
    sm: { offset: 4 },
    md: { span: 6, offset: 0 },
    xl: { span: 8, offset: 0 },
  },
  wrapperCol: {
    sm: { span: 16, offset: 4 },
    md: { span: 12, offset: 0 },
    xl: { span: 8, offset: 0 },
  },
};

export function MentorRegistry(props: Props & { courseAlias?: string }) {
  const update = useUpdate();
  const { form, formLayout, isSmallScreen } = useFormProps();
  const { resume, loading, currentStep, steps, handleSubmit } = useMentorData(props.courseAlias);

  return (
    <RegistrationPageLayout loading={loading} githubId={props.session.githubId}>
      {resume ? (
        <Row justify="center" style={{ paddingBlock: 24 }}>
          <Col xs={24} lg={18} xl={18} xxl={14}>
            <Form
              {...formItemLayout}
              layout={formLayout}
              form={form}
              initialValues={resume}
              onChange={update}
              onFinish={handleSubmit}
              scrollToFirstError
              onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
            >
              <Row justify="center" gutter={[0, 24]}>
                <Col>
                  <Space direction="vertical" align="center" size={0}>
                    <Title>Mentors registration</Title>
                    <Text type="secondary">Free courses from the developer community</Text>
                  </Space>
                </Col>
                <Col
                  span={24}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 2,
                    paddingBlock: 16,
                    paddingInline: 60,
                  }}
                >
                  <Steps current={currentStep} responsive={false}>
                    {steps.map(item => (
                      <Step key={item.title} title={isSmallScreen ? null : item.title} />
                    ))}
                  </Steps>
                </Col>
                <Col span={24}>{steps[currentStep].content}</Col>
                <Col span={24} flex="none">
                  <Footer />
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      ) : null}
    </RegistrationPageLayout>
  );
}
