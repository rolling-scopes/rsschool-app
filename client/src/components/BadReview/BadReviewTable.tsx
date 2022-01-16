import { message, Table, Typography } from 'antd';
import { GithubUserLink } from 'components';
import React from 'react';
import { checkType, IBadReview } from './BadReviewControllers';

interface IBadReviewTableProps {
  data: IBadReview[];
  type: checkType;
}

export const BadReviewTable = ({ data, type }: IBadReviewTableProps) => {
  const { Text } = Typography;

  const columns = [
    {
      title: 'Checker',
      dataIndex: 'checkerGithubId',
      key: 'checkerGithubId',
      render: (id: string) => <GithubUserLink value={id} />,
    },
    {
      title: 'Task',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Student',
      dataIndex: 'studentGithubId',
      key: 'studentGithubId',
      render: (id: string) => <GithubUserLink value={id} />,
    },
    {
      title: "Checker's score",
      dataIndex: 'checkerScore',
      key: 'checkerScore',
    },
    {
      title: 'Average student score',
      dataIndex: 'studentAvgScore',
      key: 'studentAvgScore',
    },
    {
      title: "Checker's comment",
      dataIndex: 'comment',
      key: 'comment',
    },
  ];

  let columnsType;

  switch (type) {
    case 'Bad comment':
      columnsType = columns.filter(c => c.dataIndex !== 'studentAvgScore');
      break;
    case 'Did not check':
      columnsType = columns.filter(c => c.dataIndex !== 'comment');
      break;
    default:
      message.error('Something went wrong');
  }

  return (
    <>{data.length ? <Table columns={columnsType} dataSource={data} scroll={{ x: true }} /> : <Text>No data</Text>}</>
  );
};
