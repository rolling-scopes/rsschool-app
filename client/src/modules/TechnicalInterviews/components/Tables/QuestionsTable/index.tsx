import { message, Table } from 'antd';
import { getQuestionsColumns } from 'modules/TechnicalInterviews/data/getColumns';
import { InterviewQuestionService } from 'services/interviewQuestion';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';

type Props = {
  data: InterviewQuestion[];
  handleEditQuestion: (question: InterviewQuestion) => void;
  loadData: () => Promise<void>;
  categories: InterviewQuestionCategory[];
};

export function QuestionsTable(props: Props) {
  const { data, handleEditQuestion, loadData, categories } = props;
  const interviewQuestionService = new InterviewQuestionService();

  const handleDeleteQuestion = async (id: number) => {
    try {
      await interviewQuestionService.deleteInterviewQuestion(id);
      await loadData();
    } catch (error) {
      message.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <Table
      style={{ margin: 8 }}
      dataSource={data}
      columns={getQuestionsColumns(handleEditQuestion, handleDeleteQuestion, categories)}
    />
  );
}
