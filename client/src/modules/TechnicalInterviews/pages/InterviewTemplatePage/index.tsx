import { Layout, Form, Input, Button, Row, Col, Popconfirm } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { AdminSider, Header, Session } from 'components';
import { InterviewQuestion } from 'services/models';
import { useRouter } from 'next/router';
import FormList from 'antd/lib/form/FormList';
import FormItem from 'antd/lib/form/FormItem';

const { Content } = Layout;

type Props = { session: Session; questions: InterviewQuestion[] };

export function InterviewTemplatePage(props: Props) {
  const router = useRouter();
  const [mode, id] = Array.isArray(router.query.slug) ? router.query.slug : [router.query.slug];
  const [form] = Form.useForm();
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Interview Template" username={props.session.githubId} />
        <Content style={{ margin: 12 }}>
          <Form size="middle" layout="vertical" form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 10 }}>
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
              {(modules, { add, remove }) => (
                <>
                  {modules.map(module => (
                    <>
                      <Form.Item
                        {...module}
                        label="Module Name"
                        name={[module.name, 'name']}
                        fieldKey={[module.fieldKey, 'name']}
                        rules={[{ required: true, message: 'Missing name' }]}
                        wrapperCol={{ span: 16 }}
                      >
                        <Row gutter={16} align="middle">
                          <Col span={8}>
                            <Input />
                          </Col>
                          <Col span={1}>
                            <Popconfirm title="Sure to delete?" onConfirm={() => remove(module.name)}>
                              <Button size="small" icon={<DeleteOutlined size={8} />} danger />
                            </Popconfirm>
                          </Col>
                        </Row>
                        <FormList name="questions">
                          {(questions, { add, remove }) => (
                            <>
                              <FormItem wrapperCol={{ span: 6 }} style={{ marginTop: 8 }}>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                  Add Question
                                </Button>
                              </FormItem>
                            </>
                          )}
                        </FormList>
                      </Form.Item>
                    </>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Module
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </Content>
      </Layout>
    </Layout>
  );
}
