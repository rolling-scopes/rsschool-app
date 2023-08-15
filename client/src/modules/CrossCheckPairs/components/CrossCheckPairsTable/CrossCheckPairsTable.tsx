import { Table, TablePaginationConfig } from 'antd';
import { CrossCheckPairDto } from 'api';
import { FilterValue, SorterResult } from 'antd/lib/table/interface';
import {
  CustomColumnType,
  fields,
  getCrossCheckPairsColumns,
} from 'modules/CrossCheckPairs/data/getCrossCheckPairsColumns';
import css from 'styled-jsx/css';

export type Filters = Omit<typeof fields, 'score' | 'submittedDate' | 'reviewedDate'>;

interface CustomSorterResult<RecordType> extends SorterResult<RecordType> {
  column?: CustomColumnType<RecordType>;
}

export type Sorter<RecordType> = CustomSorterResult<RecordType> | CustomSorterResult<RecordType>[];

type CrossCheckTableProps = {
  loaded: boolean;
  crossCheckPairs: CrossCheckPairDto[];
  pagination: TablePaginationConfig;
  onChange: (
    pagination: TablePaginationConfig,
    filters: Record<keyof Filters, FilterValue | null>,
    sorter: Sorter<CrossCheckPairDto>,
  ) => void;
  viewComment: (value: CrossCheckPairDto) => void;
};

export const CrossCheckPairsTable = ({
  loaded,
  crossCheckPairs,
  pagination,
  onChange,
  viewComment,
}: CrossCheckTableProps) => {
  if (!loaded) return null;

  // where 800 is approximate sum of basic columns (GitHub, Name, etc.)
  const tableWidth = 800;
  return (
    <>
      <Table<CrossCheckPairDto>
        className="table-score"
        showHeader
        scroll={{ x: tableWidth, y: 'calc(100vh - 250px)' }}
        pagination={pagination}
        dataSource={crossCheckPairs}
        size="small"
        rowClassName={'cross-check-table-row'}
        onChange={onChange}
        key="id"
        columns={getCrossCheckPairsColumns(viewComment)}
      />
      <style jsx>{styles}</style>
    </>
  );
};

const styles = css`
  :global(.cross-check-table-row, .table-score td, .table-score th) {
    padding: 0 5px !important;
    font-size: 11px;
  }
`;
