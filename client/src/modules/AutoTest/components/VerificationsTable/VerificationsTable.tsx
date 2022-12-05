import { Table, Typography } from 'antd';
import { ColumnType } from 'antd/lib/table';
import React, { useMemo } from 'react';
import { dateWithTimeZoneRenderer } from 'components/Table';
import { Verification } from 'services/course';

const { Text } = Typography;

function getColumns(maxScore: number): ColumnType<Verification>[] {
  return [
    {
      key: 'date-time',
      title: 'Date / Time',
      dataIndex: 'createdDate',
      render: createdDate => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(createdDate);
      },
    },
    {
      key: 'score',
      title: 'Score / Max',
      dataIndex: 'score',
      render: score => {
        return (
          <Text>
            {score ?? 0} / {maxScore}
          </Text>
        );
      },
    },
    {
      key: 'accuracy',
      title: 'Accuracy',
      render: (_, row: Verification) => {
        const accuracyWordWithNumber = /accuracy:\s+(\d+%)/gi;
        const [, accuracyNumber] = accuracyWordWithNumber.exec(row.details) ?? [];
        return accuracyNumber ?? 'N/A';
      },
    },
    {
      key: 'details',
      title: 'Details',
      dataIndex: 'details',
    },
  ];
}

type VerificationsTableProps = {
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
