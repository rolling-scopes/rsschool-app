import { Button, Col, Form, FormInstance, Input, InputNumber, Row } from 'antd';
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
  form: FormInstance<any>;
  index: number;
};

export function ModuleQuestions(props: Props) {
  const { moduleQuestions, interviewCategories, interviewQuestions, actions } = props;
  const [modalQuestionIsVisible, setModalQuestionIsVisible] = useState(false);

  const handleModalQuestionCancel = () => {
    setModalQuestionIsVisible(false);
  };

  const handleAddQuestion = (question: InterviewQuestion) => {
    actions.add({ ...question, weight: 1 });
  };

  return (
    <>
      {moduleQuestions.map(field => {
        return (
          <Row align="middle" key={field.key} justify="start" gutter={[8, 0]}>
            <Col span={8}>
              <Form.Item
                {...field}
                name={[field.name, 'question']}
                fieldKey={[field.fieldKey, 'question']}
                wrapperCol={{ span: 24 }}
                label="question"
                style={{ marginBottom: 4 }}
              >
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col flex="0 1 0">
              <Form.Item
                {...field}
                label="weight"
                name={[field.name, 'weight']}
                wrapperCol={{ span: 12 }}
                labelCol={{ span: 12 }}
                fieldKey={[field.fieldKey, 'weight']}
                style={{ marginBottom: 4 }}
              >
                <InputNumber min={1} max={5} />
              </Form.Item>
            </Col>
            <Col style={{ alignSelf: 'end', marginBottom: '6px' }} className="gutter-row" span={2}>
              <Button size="small" icon={<DeleteOutlined />} danger onClick={() => actions.remove(field.name)} />
            </Col>
          </Row>
        );
      })}
      <FormItem wrapperCol={{ span: 6 }} style={{ marginTop: 8 }}>
        <Button
          size="small"
          type="ghost"
          onClick={() => {
            setModalQuestionIsVisible(true);
          }}
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
        addQuestionToModule={handleAddQuestion}
      />
    </>
  );
}
