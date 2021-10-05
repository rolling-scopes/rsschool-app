import { Button } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';
import { QuestionsTable } from '../../Tables/QuestionsTable';

type Props = {
  questions: InterviewQuestion[];
  categories: InterviewQuestionCategory[];
  isVisible: boolean;
  onCancel: () => void;
  addQuestionToModule?: (question: InterviewQuestion) => void;
};

export function ModuleQuestionsModal(props: Props) {
  const { isVisible, onCancel, questions, categories, addQuestionToModule } = props;

  return (
    <Modal
      title={'Add questions'}
      visible={isVisible}
      onCancel={onCancel}
      width={'80vw'}
      footer={[
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
      ]}
    >
      <QuestionsTable data={questions} categories={categories} addQuestionToModule={addQuestionToModule} />
    </Modal>
  );
}
