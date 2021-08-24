import { Button, Popconfirm, Popover, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';
import { getColumnSearchProps, stringSorter } from 'components/Table';

export function getQuestionsColumns(
  handleEditQuestion: (question: InterviewQuestion) => void,
  handleDeleteQuestion: (id: number) => Promise<void>,
  questionCategories: InterviewQuestionCategory[],
) {
  return [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: stringSorter<InterviewQuestion>('title'),
      width: 200,
      ...getColumnSearchProps('title'),
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
      filters: [
        ...questionCategories.reduce((acc, el) => {
          acc.push({ text: el.name, value: el.name });
          return acc;
        }, [] as { text: string; value: string }[]),
      ],
      onFilter: (value: string, record: InterviewQuestion) => record.categories.filter(el => el.name === value).length > 0,
    },
    {
      title: 'Actions',
      width: 150,
      key: 'actions',
      render: (_: InterviewQuestion) => (
        <Space size="middle">
          <Button size="small" icon={<EditOutlined size={8} />} onClick={() => handleEditQuestion(_)} />
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteQuestion(_.id)}>
            <Button size="small" icon={<DeleteOutlined size={8} />} danger />
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
      sorter: stringSorter<InterviewQuestionCategory>('name'),
      width: 200,
      ...getColumnSearchProps('name'),
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
          <Button size="small" icon={<EditOutlined size={8} onClick={() => handleEditCategory(_)} />} />
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteCategory(_.id)}>
            <Button size="small" icon={<DeleteOutlined size={8} />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
