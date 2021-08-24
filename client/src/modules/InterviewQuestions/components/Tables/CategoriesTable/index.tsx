import { Table } from 'antd';
import { getCategoriesColumns } from 'modules/InterviewQuestions/data/getColumns';
import { InterviewQuestionCategory } from 'services/models';

type Props = {
  data: InterviewQuestionCategory[];
  handleEditCategory: (category: InterviewQuestionCategory) => void;
};

export function CategoriesTable(props: Props) {
  const { data, handleEditCategory } = props;

  return (
    <Table
      pagination={{ pageSize: 50 }}
      dataSource={data}
      style={{ margin: 8 }}
      columns={getCategoriesColumns(handleEditCategory)}
    />
  );
}
