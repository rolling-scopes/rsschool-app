import { Button, Modal, Table, Typography } from 'antd';
import { GithubUserLink } from 'components';
import React from 'react';
import { checkType, IBadReview } from './BadReviewControllers';

interface IBadReviewTableProps {
  data: IBadReview[];
  type: checkType;
}

export const BadReviewTable = ({ data, type }: IBadReviewTableProps) => {
  const [modal, contextHolder] = Modal.useModal();
  const { Text } = Typography;

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
      render: (comment: string) => (
        <Button
          onClick={() =>
            modal.info({
              width: 600,
              title: 'Comment',
              content: comment.split('\n').map((text, id) => <p key={id}>{text}</p>),
            })
          }
          type="link"
          size="small"
        >
          Show
        </Button>
      ),
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
  }
  return (
    <>
      {contextHolder}
      {data.length ? <Table columns={columnsType} dataSource={data} /> : <Text>No data</Text>}
    </>
  );
};
