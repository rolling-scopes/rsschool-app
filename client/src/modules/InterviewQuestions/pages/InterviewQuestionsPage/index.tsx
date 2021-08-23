import { Button, Col, Layout, message, Row, Spin } from 'antd';
import { AdminSider, Header, Session } from 'components';
import { AddCategoryButton } from 'modules/InterviewQuestions/components/AddCategoryButton';
import { AddQuestionButton } from 'modules/InterviewQuestions/components/AddQuestionButton';
import { QuestionsTable } from 'modules/InterviewQuestions/components/QuestionsTable';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { InterviewQuestionCategoryService, InterviewQuestionService } from 'services/interviewQuestion';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';

const { Content } = Layout;
type Props = { session: Session };

export function InterviewQuestionsPage(props: Props) {
  const [questions, setQuestions] = useState([] as InterviewQuestion[]);
  console.log('🚀 ~ file: index.tsx ~ line 13 ~ Page ~ questions', questions);
  const [categories, setCategories] = useState([] as InterviewQuestionCategory[]);
  console.log('🚀 ~ file: index.tsx ~ line 15 ~ Page ~ categories', categories);
  const [loading, setLoading] = useState(false);

  const interviewQuestionService = new InterviewQuestionService();
  const interviewQuestionCategoryService = new InterviewQuestionCategoryService();

  const loadData = async () => {
    try {
      setLoading(true);
      const [questions, categories] = await Promise.all([
        interviewQuestionService.getInterviewQuestions(),
        interviewQuestionCategoryService.getInterviewQuestionCategories(),
      ]);
      setQuestions(questions);
      setCategories(categories);
    } catch (error) {
      message.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useAsync(loadData, []);

  const addQuestionHandler = () => {
    console.log('s');
  };

  const addCategoryHandler = () => {
    console.log('s');
  };

  const editQuestionHandler = (question: InterviewQuestion) => {
    console.log(question);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Questions" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Row gutter={16} justify="start">
            <Col>
              <AddQuestionButton onClick={addQuestionHandler} />
            </Col>
            <Col>
              <AddCategoryButton onClick={addCategoryHandler} />
            </Col>
          </Row>
        </Content>
        <Content>
          <Spin spinning={loading}>
            <QuestionsTable data={questions} editQuestionHandler={editQuestionHandler} />
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
}
