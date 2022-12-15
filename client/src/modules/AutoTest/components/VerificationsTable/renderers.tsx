import { Space, Typography } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { dateWithTimeZoneRenderer } from 'components/Table';
import { CourseTaskDetailedDtoTypeEnum } from 'api';
import { CheckSquareTwoTone, CloseSquareTwoTone } from '@ant-design/icons';
import { Breakpoint } from 'antd/lib/_util/responsiveObserve';
import { Verification } from 'services/course';

const { Text, Link, Title } = Typography;

const DISPLAY_ALL: Breakpoint[] = ['sm'];
const DISPLAY_ACCURACY: Breakpoint[] = ['md'];
const DISPLAY_MOBILE: Breakpoint[] = ['xs'];

type Metadata = {
  id: string;
  url: string;
  name: string;
  completed: boolean;
};

export function getColumns(maxScore: number): ColumnType<Verification>[] {
  return [
    {
      key: 'date-time',
      title: 'Date / Time',
      dataIndex: 'createdDate',
      responsive: DISPLAY_ALL,
      render: renderDate,
    },
    {
      key: 'score',
      title: 'Score / Max',
      dataIndex: 'score',
      responsive: DISPLAY_ALL,
      render: renderScore(maxScore),
    },
    {
      key: 'accuracy',
      title: 'Accuracy',
      responsive: DISPLAY_ACCURACY,
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
      responsive: DISPLAY_ALL,
      render: renderDetails,
    },
    {
      key: 'details',
      title: 'Details',
      render: renderMobileRow(maxScore),
      responsive: DISPLAY_MOBILE,
    },
  ];
}

function renderDetails(value: string, row: Verification) {
  if (row?.courseTask?.type === CourseTaskDetailedDtoTypeEnum.Codewars) {
    return (
      <>
        <Title level={5}>{value}</Title>
        <Space direction="vertical" align='start'>
          {(row?.metadata as Metadata[])?.map(({ id, url, name, completed }, index: number) => (
            <Link key={id} href={url} target="_blank">
              {completed ? (
                <CheckSquareTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseSquareTwoTone twoToneColor="#ff4d4f" />
              )}
              <Text>
                {index}.{name}
              </Text>
            </Link>
          ))}
        </Space>
      </>
    );
  }

  return typeof value === 'string' ? value.split('\\n').map(str => <div key={str}>{str}</div>) : value;
}

function renderScore(maxScore: number) {
  return (score: number) => (
    <Text>
      {score ?? 0} / {maxScore}
    </Text>
  );
}

function renderDate(createdDate: string) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(createdDate);
}

function renderMobileRow(maxScore: number) {
  return (_: string, row: Verification) => (
    <Space direction="vertical">
      {renderDate(row.createdDate)}
      {renderScore(maxScore)(row.score)}
      {renderDetails(row.details, row)}
    </Space>
  );
}
