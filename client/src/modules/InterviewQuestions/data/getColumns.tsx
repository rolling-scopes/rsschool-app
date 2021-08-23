import { Button, Popconfirm, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';

export function getColumns(editQuestionHandler: (question: InterviewQuestion) => void) {
  return [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: InterviewQuestionCategory[]) => (
        <>
          {categories.map(category => (
            <Tag>{category.name}</Tag>
          ))}
        </>
      ),
      width: 200,
    },
    {
      title: 'Actions',
      width: 150,
      key: 'actions',
      render: (_: InterviewQuestion) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => editQuestionHandler(_)} />
          <Popconfirm title="Sure to delete?">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
