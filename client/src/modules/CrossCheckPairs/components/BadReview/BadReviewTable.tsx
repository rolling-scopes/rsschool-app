import { message, Table, Typography } from 'antd';
import { GithubUserLink } from 'components/GithubUserLink';
import React from 'react';
import { BadCommentCheckerDto, MaxScoreCheckerDto } from 'api';

import { checkType } from './BadReviewControllers';

type Props = {
  data: BadCommentCheckerDto[] | MaxScoreCheckerDto[];
  type: checkType;
};

export const BadReviewTable = ({ data, type }: Props) => {
  const { Text } = Typography;

  const columns = [
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

  let columnsType;

  switch (type) {
    case 'badcomment':
      columnsType = columns.filter(c => c.dataIndex !== 'studentAvgScore');
      break;
    case 'didnotcheck':
      columnsType = columns.filter(c => c.dataIndex !== 'comment');
      break;
    default:
      message.error('Something went wrong');
  }

  if (!columnsType) {
    return null;
  }

  if (data.length === 0) {
    return <Text>No data</Text>;
  }

  return (
    <Table<BadCommentCheckerDto | MaxScoreCheckerDto> columns={columnsType} dataSource={data} scroll={{ x: true }} />
  );
};
