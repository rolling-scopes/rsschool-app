import { Button, Form, Input, Space } from 'antd';
import { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';
import { useState } from 'react';
import FormItem from 'antd/lib/form/FormItem';
import { ModuleQuestionsModal } from '../Modals/ModuleQuestionsModal';
import { PlusOutlined } from '@ant-design/icons';

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
          <Space key={field.key} style={{ display: 'flex', marginTop: 8 }} align="center">
            <Form.Item {...field} style={{ marginBottom: 0 }}>
              <Input disabled />
            </Form.Item>
          </Space>
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
