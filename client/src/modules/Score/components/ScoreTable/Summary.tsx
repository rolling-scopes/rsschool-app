import { Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { ScoreStudentDto } from 'api';

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
        const value: any = Array.isArray(dataIndex)
          ? dataIndex.reduce((result: any, property) => {
              return Object.prototype.hasOwnProperty.call(result ?? {}, property as string)
                ? result[property as string]
                : null;
            }, studentScore)
          : studentScore[dataIndex as keyof ScoreStudentDto];

        return (
          <Table.Summary.Cell key={index} index={index + 1}>
            {render ? render(value, studentScore, index + 1) : value}
          </Table.Summary.Cell>
        );
      })}
    </Table.Summary.Row>
  );
};
