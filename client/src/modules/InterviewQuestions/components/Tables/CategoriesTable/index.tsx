import { message, Table } from 'antd';
import { getCategoriesColumns } from 'modules/InterviewQuestions/data/getColumns';
import { InterviewQuestionCategoryService } from 'services/interviewQuestion';
import { InterviewQuestionCategory } from 'services/models';

type Props = {
  data: InterviewQuestionCategory[];
  handleEditCategory: (category: InterviewQuestionCategory) => void;
  loadData: () => Promise<void>;
};

export function CategoriesTable(props: Props) {
  const { data, handleEditCategory, loadData } = props;

  const interviewQuestionService = new InterviewQuestionCategoryService();

  const handleDeleteQuestion = async (id: number) => {
    try {
      await interviewQuestionService.deleteInterviewQuestionCategory(id);
      await loadData();
    } catch (error) {
      message.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <Table
      dataSource={data}
      style={{ margin: 8 }}
      columns={getCategoriesColumns(handleEditCategory, handleDeleteQuestion)}
    />
  );
}
