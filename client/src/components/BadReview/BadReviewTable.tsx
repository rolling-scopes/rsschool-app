import { Table, Typography } from 'antd';
import { GithubUserLink } from 'components';
import React from 'react';
import { checkType, IBadReview } from './BadReviewControllers';

interface IBadReviewTableProps {
  data: IBadReview[];
  type: checkType;
}

const columns = [
  {
    title: 'Task',
    dataIndex: 'taskName',
    key: 'taskName',
  },
  {
    title: 'Checker',
    dataIndex: 'checkerGithubId',
    key: 'checkerGithubId',
    render: (id: string) => <GithubUserLink value={id} />,
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

export const BadReviewTable = ({ data, type }: IBadReviewTableProps) => {
  const { Text } = Typography;
  let columnsType;
  switch (type) {
    case 'Bad comment':
      columnsType = columns.filter(c => c.dataIndex !== 'comment');
      break;
    case 'Did not check':
      columnsType = columns.filter(c => c.dataIndex !== 'studentAvgScore');
      break;
  }
  return data.length ? <Table columns={columnsType} dataSource={data} /> : <Text>No data</Text>;
};
