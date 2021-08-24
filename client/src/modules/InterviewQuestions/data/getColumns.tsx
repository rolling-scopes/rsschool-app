import { Button, Popconfirm, Popover, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';

export function getQuestionsColumns(
  handleEditQuestion: (question: InterviewQuestion) => void,
  handleDeleteQuestion: (id: number) => Promise<void>,
) {
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
          <Button icon={<EditOutlined size={12} />} onClick={() => handleEditQuestion(_)} />
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteQuestion(_.id)}>
            <Button icon={<DeleteOutlined size={12} />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];
}

export function getCategoriesColumns(
  handleEditCategory: (category: InterviewQuestionCategory) => void,
  handleDeleteCategory: (id: number) => Promise<void>,
) {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Questions',
      dataIndex: 'questions',
      key: 'questions',
      render: (questions: InterviewQuestion[]) => (
        <>
          {questions.map(question => (
            <Popover content={question.question} title={question.title} trigger="hover">
              <Tag>{question.title}</Tag>
            </Popover>
          ))}
        </>
      ),
    },
    {
      title: 'Actions',
      width: 150,
      key: 'actions',
      render: (_: InterviewQuestionCategory) => (
        <Space size="middle">
          <Button icon={<EditOutlined size={12} onClick={() => handleEditCategory(_)} />} />
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteCategory(_.id)}>
            <Button icon={<DeleteOutlined size={12} />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
