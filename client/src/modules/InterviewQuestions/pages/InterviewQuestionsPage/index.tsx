import { Col, Layout, message, Row, Spin } from 'antd';
import { AdminSider, Header, Session } from 'components';
import { AddCategoryButton } from 'modules/InterviewQuestions/components/AddCategoryButton';
import { AddQuestionButton } from 'modules/InterviewQuestions/components/AddQuestionButton';
import { QuestionsModalForm } from 'modules/InterviewQuestions/components/QuestionModalForm';
import { QuestionsTable } from 'modules/InterviewQuestions/components/QuestionsTable';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { InterviewQuestionCategoryService, InterviewQuestionService } from 'services/interviewQuestion';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';

const { Content } = Layout;
type Props = { session: Session };

export function InterviewQuestionsPage(props: Props) {
  const [questions, setQuestions] = useState([] as InterviewQuestion[]);
  const [categories, setCategories] = useState([] as InterviewQuestionCategory[]);
  const [modalQuestionData, setModalQuestionData] = useState(null as InterviewQuestion | null);
  const [modalQuestionIsVisible, setModalQuestionIsVisible] = useState(false);
  const [modalCategoryData, setModalCategoryData] = useState(null as InterviewQuestionCategory | null);
  const [modalCategoryIsVisible, setModalCategoryIsVisible] = useState(false);
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

  const handleAddQuestion = () => {
    setModalQuestionData(null);
    setModalQuestionIsVisible(true);
  };

  const handleEditQuestion = (question: InterviewQuestion) => {
    setModalQuestionData(question);
    setModalQuestionIsVisible(true);
  };

  const handleModalQuestionCancel = () => {
    setModalQuestionIsVisible(false);
  };

  const handleAddCategory = () => {
    setModalCategoryData(null);
    setModalCategoryIsVisible(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Questions" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Row gutter={16} justify="start">
            <Col>
              <AddQuestionButton onClick={handleAddQuestion} />
            </Col>
            <Col>
              <AddCategoryButton onClick={handleAddCategory} />
            </Col>
          </Row>
        </Content>
        <Content>
          <Spin spinning={loading}>
            <QuestionsTable data={questions} handleEditQuestion={handleEditQuestion} />
          </Spin>
        </Content>
      </Layout>
      <QuestionsModalForm
        categories={categories}
        question={modalQuestionData}
        isVisible={modalQuestionIsVisible}
        onCancel={handleModalQuestionCancel}
        loadData={loadData}
      />
    </Layout>
  );
}
