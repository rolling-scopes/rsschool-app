import { Button, Col, Form, Input, InputNumber, Row } from 'antd';
import { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';
import { useState } from 'react';
import FormItem from 'antd/lib/form/FormItem';
import { ModuleQuestionsModal } from '../Modals/ModuleQuestionsModal';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

type Props = {
  moduleQuestions: FormListFieldData[];
  actions: FormListOperation;
  interviewQuestions: InterviewQuestion[];
  interviewCategories: InterviewQuestionCategory[];
};

export function ModuleQuestions(props: Props) {
  const { moduleQuestions, interviewCategories, interviewQuestions, actions } = props;
  const [modalQuestionIsVisible, setModalQuestionIsVisible] = useState(false);

  const handleModalQuestionCancel = () => {
    setModalQuestionIsVisible(false);
  };

  return (
    <>
      {moduleQuestions.map(field => {
        return (
          <Row align="middle" key={field.key}>
            <Col>
              <Form.Item
                {...field}
                name={[field.name, 'name']}
                fieldKey={[field.fieldKey, 'question']}
                label="question"
                wrapperCol={{ span: 20 }}
                labelCol={{ span: 16 }}
                style={{ marginRight: 8, marginBottom: 4 }}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                {...field}
                label="weight"
                name={[field.name, 'weight']}
                fieldKey={[field.fieldKey, 'weight']}
                wrapperCol={{ span: 16 }}
                labelCol={{ span: 16 }}
                style={{ marginRight: 8, marginBottom: 0 }}
              >
                <InputNumber min={1} max={5} />
              </Form.Item>
            </Col>
            <Col>
              <Button size="small" icon={<DeleteOutlined />} danger onClick={() => actions.remove(field.name)} />
            </Col>
          </Row>
        );
      })}
      <FormItem wrapperCol={{ span: 6 }} style={{ marginTop: 8 }}>
        <Button
          type="dashed"
          onClick={() => {
            setModalQuestionIsVisible(true);
          }}
          block
          icon={<PlusOutlined />}
        >
          Add Question
        </Button>
      </FormItem>
      <ModuleQuestionsModal
        questions={interviewQuestions}
        categories={interviewCategories}
        isVisible={modalQuestionIsVisible}
        onCancel={handleModalQuestionCancel}
        addQuestionToModule={actions.add}
        removeQuestionFromModule={actions.remove}
      />
    </>
  );
}
