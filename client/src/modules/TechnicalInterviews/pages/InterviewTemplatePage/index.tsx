import { Layout, Form, Input, Button, Row, Col, Popconfirm, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { AdminSider, Header, Session } from 'components';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';
import { useRouter } from 'next/router';
import FormList, { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
import FormItem from 'antd/lib/form/FormItem';
import { useState } from 'react';
import { ModuleQuestionsModal } from 'modules/TechnicalInterviews/components/Modals/ModuleQuestionsModal';
import { ModuleQuestions } from 'modules/TechnicalInterviews/components/Forms/ModuleQuestions';

const { Content } = Layout;

type Props = {
  session: Session;
  interviewQuestions: InterviewQuestion[];
  interviewCategories: InterviewQuestionCategory[];
};

export function InterviewTemplatePage(props: Props) {
  const { session, interviewQuestions, interviewCategories } = props;
  const router = useRouter();
  const [modalQuestionIsVisible, setModalQuestionIsVisible] = useState(false);
  const [mode, id] = Array.isArray(router.query.slug) ? router.query.slug : [router.query.slug];
  const [form] = Form.useForm();

  const onFinish = values => {
    console.log('Received values of form:', values);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Interview Template" username={props.session.githubId} />
        <Content style={{ margin: 12 }}>
          <Form
            size="middle"
            layout="vertical"
            form={form}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
            onFinish={onFinish}
          >
            <Form.Item
              key="templateName"
              name="templateName"
              label="Template Name"
              labelAlign="left"
              rules={[{ required: true }]}
              wrapperCol={{ span: 10 }}
            >
              <Input />
            </Form.Item>
            <Form.List name="modules">
              {(modules, { add: addModule, remove: removeModule }) => (
                <>
                  {modules.map((module, moduleIndex) => (
                    <>
                      <Form.Item
                        {...module}
                        label="Module Name"
                        name={[module.name, 'moduleName']}
                        fieldKey={[module.fieldKey, 'moduleKey']}
                        rules={[{ required: true, message: 'Missing module name' }]}
                        wrapperCol={{ span: 16 }}
                      >
                        <Row gutter={16} align="middle">
                          <Col span={8}>
                            <Input />
                          </Col>
                          <Col span={1}>
                            <Popconfirm title="Sure to delete?" onConfirm={() => removeModule(module.name)}>
                              <Button size="small" icon={<DeleteOutlined size={8} />} danger />
                            </Popconfirm>
                          </Col>
                        </Row>
                      </Form.Item>
                      <FormList name={[module.name, 'moduleQuestions']}>
                        {(moduleQuestions, actions) => (
                          <ModuleQuestions
                            moduleQuestions={moduleQuestions}
                            actions={actions}
                            interviewCategories={interviewCategories}
                            interviewQuestions={interviewQuestions}
                          />
                        )}
                      </FormList>
                    </>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => addModule()} block icon={<PlusOutlined />}>
                      Add Module
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          {/* <ModuleQuestionsModal
            questions={interviewQuestions}
            categories={interviewCategories}
            isVisible={modalQuestionIsVisible}
            onCancel={handleModalQuestionCancel}
            // addQuestionToModule={addQuestion}
            // removeQuestionFromModule={removeQuestion}
          /> */}
        </Content>
      </Layout>
    </Layout>
  );
}
