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
      scroll={{ x: 'calc(100vw - 200px)', y: 'calc(100vh - 250px)' }}
      dataSource={data}
      style={{ margin: 8 }}
      columns={getCategoriesColumns(handleEditCategory, handleDeleteQuestion)}
    />
  );
}
