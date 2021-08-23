import { Table } from 'antd';
import { getColumns } from 'modules/InterviewQuestions/data/getColumns';
import { InterviewQuestion } from 'services/models';

type Props = {
  data: InterviewQuestion[];
  editQuestionHandler: (question: InterviewQuestion) => void;
};

export function QuestionsTable(props: Props) {
  return (
    <Table pagination={{ pageSize: 100 }} dataSource={props.data} columns={getColumns(props.editQuestionHandler)} />
  );
}
