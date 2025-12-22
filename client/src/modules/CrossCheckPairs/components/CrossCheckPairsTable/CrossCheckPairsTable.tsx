import { Table, TablePaginationConfig } from 'antd';
import { CrossCheckPairDto } from '@client/api';
import { FilterValue, SorterResult } from 'antd/lib/table/interface';
import {
  CustomColumnType,
  fields,
  getCrossCheckPairsColumns,
} from 'modules/CrossCheckPairs/data/getCrossCheckPairsColumns';

import styles from './CrossCheckPairsTable.module.css';

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
        className={styles.tableScore}
        showHeader
        scroll={{ x: tableWidth, y: 'calc(100vh - 250px)' }}
        pagination={pagination}
        dataSource={crossCheckPairs}
        size="small"
        rowClassName={styles.tableRow}
        onChange={onChange}
        key="id"
        columns={getCrossCheckPairsColumns(viewComment)}
      />
    </>
  );
};
