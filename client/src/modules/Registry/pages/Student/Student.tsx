import { Col, Form, Row, Space, Typography } from 'antd';
import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { Session } from 'components/withSession';
import { useUpdate } from 'react-use';
import { Course } from 'services/models';
import { useFormLayout, useStudentData } from 'modules/Registry/hooks';
import { Footer, FormSteps, NoCourses } from 'modules/Registry/components';
import { DEFAULT_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';

const { Title, Text } = Typography;

export const TYPES = {
  MENTOR: 'mentor',
  STUDENT: 'student',
};

type Props = {
  courses?: Course[];
  session: Session;
};

export function StudentRegistry(props: Props & { courseAlias?: string }) {
  const { githubId } = props.session;
  const update = useUpdate();
  const { formLayout } = useFormLayout();

  const { courses, loading, registered, steps, currentStep, form, handleSubmit } = useStudentData(
    githubId,
    props.courseAlias,
  );

  let content: React.ReactNode;
  if (loading || registered) {
    content = undefined;
  } else if (!courses.length) {
    content = <NoCourses />;
  } else {
    content = (
      <Row justify="center" style={{ paddingBlock: 24 }}>
        <Col xs={24} lg={18} xl={18} xxl={14}>
          <Form
            {...DEFAULT_FORM_ITEM_LAYOUT}
            layout={formLayout}
            form={form}
            onChange={update}
            onFinish={handleSubmit}
            onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
          >
            <Row justify="center" gutter={[0, 24]}>
              <Col>
                <Space direction="vertical" align="center" size={0}>
                  <Title>Welcome to RS School</Title>
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
    );
  }

  return (
    <RegistrationPageLayout loading={loading} githubId={props.session.githubId}>
      {content}
    </RegistrationPageLayout>
  );
}
