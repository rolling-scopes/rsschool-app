import { Col, Form, Row, Space, Typography } from 'antd';
import { useUpdate } from 'react-use';
import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { Session } from 'components/withSession';
import { Footer, FormSteps } from 'modules/Registry/components';
import type { Course } from 'services/models';
import { useMentorData, useFormLayout } from 'modules/Registry/hooks';
import { DEFAULT_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';

type Props = {
  courses?: Course[];
  session: Session;
};

const { Title, Text } = Typography;

export function MentorRegistry(props: Props & { courseAlias?: string }) {
  const update = useUpdate();
  const { formLayout } = useFormLayout();
  const { resume, loading, currentStep, steps, form, handleSubmit } = useMentorData(props.courseAlias);

  return (
    <RegistrationPageLayout loading={loading} githubId={props.session.githubId}>
      {resume ? (
        <Row justify="center" style={{ paddingBlock: 24 }}>
          <Col xs={24} lg={18} xl={18} xxl={14}>
            <Form
              {...DEFAULT_FORM_ITEM_LAYOUT}
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
                <FormSteps steps={steps} currentStep={currentStep} />
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
