import { Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { ScoreStudentDto } from 'api';
import get from 'lodash/get';

type SummaryProps = {
  visibleColumns: ColumnType<ScoreStudentDto>[];
  studentScore: ScoreStudentDto;
};

export const Summary = ({ visibleColumns, studentScore }: SummaryProps) => {
  return (
    <Table.Summary.Row>
      {/* the table has a hidden first column */}
      <Table.Summary.Cell index={0} />
      {visibleColumns.map(({ dataIndex, render }, index) => {
        const value = get(studentScore, dataIndex as string | string[], null);
        return (
          <Table.Summary.Cell key={index} index={index + 1}>
            {render ? render(value, studentScore, index + 1) : value}
          </Table.Summary.Cell>
        );
      })}
    </Table.Summary.Row>
  );
};
