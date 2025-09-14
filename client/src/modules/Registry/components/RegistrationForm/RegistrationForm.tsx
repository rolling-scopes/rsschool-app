import { Col, Form, FormInstance, Row, Steps, theme } from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useUpdate } from 'react-use';
import { Footer, Header } from 'modules/Registry/components';
import { DEFAULT_FORM_ITEM_LAYOUT, FORM_TITLES } from 'modules/Registry/constants';
import { useFormLayout } from 'modules/Registry/hooks';
import { useMemo } from 'react';

type Props = {
  form: FormInstance;
  handleSubmit: (values: any) => Promise<void>;
  steps: {
    title: string;
    content: JSX.Element;
  }[];
  currentStep: number;
  initialValues?: Store;
  type?: 'mentor' | 'student';
};

export function RegistrationForm({ form, handleSubmit, steps, currentStep, initialValues, type = 'mentor' }: Props) {
  const update = useUpdate();
  const { formLayout, isSmallScreen } = useFormLayout();
  const stepItems = useMemo(
    () => steps.map(({ title }) => ({ title: isSmallScreen ? null : title })),
    [steps, isSmallScreen],
  );
  const title = type === 'mentor' ? FORM_TITLES.mentorForm : FORM_TITLES.studentForm;
  const { token } = theme.useToken();

  return (
    <Row justify="center" style={{ paddingBlock: 24 }}>
      <Col xs={24} sm={20} md={24} lg={18} xxl={14}>
        <Form
          {...DEFAULT_FORM_ITEM_LAYOUT}
          role="form"
          layout={formLayout}
          form={form}
          initialValues={initialValues}
          onChange={update}
          onFinish={handleSubmit}
          onFinishFailed={({ errorFields: [errorField] }) => errorField && form.scrollToField(errorField.name)}
        >
          <Row justify="center" gutter={[0, 24]}>
            <Col>
              <Header title={title} />
            </Col>
            <Col
              span={24}
              style={{
                background: token.colorBgContainer,
                borderRadius: 2,
                paddingBlock: 16,
                paddingInline: 60,
              }}
            >
              <Steps current={currentStep} responsive={false} items={stepItems} />
            </Col>
            <Col span={24}>{steps[currentStep]?.content}</Col>
            <Col span={24} flex="none">
              <Footer />
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
}
