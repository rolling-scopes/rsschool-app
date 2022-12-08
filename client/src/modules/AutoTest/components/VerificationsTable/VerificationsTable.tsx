import { Table } from 'antd';
import React, { useMemo } from 'react';
import { Verification } from 'services/course';
import { getColumns } from './renderers';

export type VerificationsTableProps = {
  maxScore: number;
  verifications: Verification[];
  loading: boolean;
};

function VerificationsTable({ maxScore, verifications, loading }: VerificationsTableProps) {
  const columns = useMemo(() => getColumns(maxScore), [maxScore]);

  return (
    <Table
      locale={{
        // disable default tooltips on sortable columns
        triggerDesc: undefined,
        triggerAsc: undefined,
        cancelSort: undefined,
      }}
      pagination={false}
      columns={columns}
      dataSource={verifications}
      size="middle"
      rowKey="id"
      loading={loading}
    />
  );
}

export default VerificationsTable;
