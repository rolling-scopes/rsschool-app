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
      ...getColumnSearchProps('question'),
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
      onFilter: (value: any, record: InterviewQuestion) => record.categories.filter(el => el.name === value).length > 0,
    },
    {
      title: 'Actions',
      width: 150,
      key: 'actions',
      render: (question: InterviewQuestion) => (
        <Space size="middle">
          <Button size="small" icon={<EditOutlined size={8} />} onClick={() => handleEditQuestion(question)} />
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteQuestion(question.id)}>
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
              <Tag style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {question.title || question.question}
              </Tag>
            </Popover>
          ))}
        </>
      ),
    },
    {
      title: 'Actions',
      width: 150,
      key: 'actions',
      render: (category: InterviewQuestionCategory) => (
        <Space size="middle">
          <Button size="small" icon={<EditOutlined size={8} onClick={() => handleEditCategory(category)} />} />
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteCategory(category.id)}>
            <Button size="small" icon={<DeleteOutlined size={8} />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
