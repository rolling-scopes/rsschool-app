import { Space, Table, Typography } from 'antd';
import { ColumnType } from 'antd/lib/table';
import React, { useMemo } from 'react';
import { dateWithTimeZoneRenderer } from 'components/Table';
import { Verification } from 'services/course';
import { CourseTaskDetailedDtoTypeEnum } from 'api';
import { CheckSquareTwoTone, CloseSquareTwoTone } from '@ant-design/icons';

const { Text, Link } = Typography;

type Metadata = {
  id: string;
  url: string;
  name: string;
  completed: boolean;
};

function getColumns(maxScore: number): ColumnType<Verification>[] {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return [
    {
      key: 'date-time',
      title: 'Date / Time',
      dataIndex: 'createdDate',
      render: createdDate => dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(createdDate),
    },
    {
      key: 'score',
      title: 'Score / Max',
      dataIndex: 'score',
      render: score => (
        <Text>
          {score ?? 0} / {maxScore}
        </Text>
      ),
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
      render: (value: string, row) => {
        if (row?.courseTask?.type === CourseTaskDetailedDtoTypeEnum.Codewars) {
          return (
            <>
              <Text>{value}</Text>
              <Space>
                {(row?.metadata as Metadata[])?.map(({ id, url, name, completed }, index: number) => (
                  <Link key={id} href={url} target="_blank">
                    {completed ? (
                      <CheckSquareTwoTone twoToneColor="#52c41a" />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#ff4d4f" />
                    )}
                    <Text>
                      {index}. {name}
                    </Text>
                  </Link>
                ))}
              </Space>
            </>
          );
        }

        return typeof value === 'string' ? value.split('\\n').map(str => <div key={str}>{str}</div>) : value;
      },
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
