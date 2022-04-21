import { Col, Layout, message, Row, Spin, Tabs } from 'antd';
import { AdminPageLayout } from 'components/PageLayout';
import { Session } from 'components/withSession';
import { AddCategoryButton } from 'modules/InterviewQuestions/components/Buttons/AddCategoryButton';
import { AddQuestionButton } from 'modules/InterviewQuestions/components/Buttons/AddQuestionButton';
import { CategoryModalForm } from 'modules/InterviewQuestions/components/Modals/CategoryModalForm';
import { QuestionsModalForm } from 'modules/InterviewQuestions/components/Modals/QuestionModalForm';
import { CategoriesTable } from 'modules/InterviewQuestions/components/Tables/CategoriesTable';
import { QuestionsTable } from 'modules/InterviewQuestions/components/Tables/QuestionsTable';
import { useState } from 'react';
import { InterviewQuestionCategoryService, InterviewQuestionService } from 'services/interviewQuestion';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';

const { Content } = Layout;
const { TabPane } = Tabs;
type Props = { session: Session; questions: InterviewQuestion[]; categories: InterviewQuestionCategory[] };

export function InterviewQuestionsPage(props: Props) {
  const [questions, setQuestions] = useState(props.questions);
  const [categories, setCategories] = useState(props.categories);
  const [modalQuestionData, setModalQuestionData] = useState<InterviewQuestion | null>(null);
  const [modalQuestionIsVisible, setModalQuestionIsVisible] = useState(false);
  const [modalCategoryData, setModalCategoryData] = useState<InterviewQuestionCategory | null>(null);
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

  const handleEditCategory = (category: InterviewQuestionCategory) => {
    setModalCategoryData(category);
    setModalCategoryIsVisible(true);
  };

  const handleModalCategoryCancel = () => {
    setModalCategoryIsVisible(false);
  };

  return (
    <AdminPageLayout session={props.session} title="Manage Questions">
      <Content style={{ margin: 8 }}>
        <Row gutter={16} justify="start">
          <Col>
            <AddQuestionButton onClick={handleAddQuestion} />
          </Col>
          <Col>
            <AddCategoryButton onClick={handleAddCategory} />
          </Col>
        </Row>
        <Spin spinning={loading}>
          <Tabs defaultActiveKey="QuestionsTable">
            <TabPane tab="Questions Table" key="QuestionsTable">
              <QuestionsTable
                data={questions}
                handleEditQuestion={handleEditQuestion}
                loadData={loadData}
                categories={categories}
              />
            </TabPane>
            <TabPane tab="Categories Table" key="CategoriesTable">
              <CategoriesTable data={categories} handleEditCategory={handleEditCategory} loadData={loadData} />
            </TabPane>
          </Tabs>
        </Spin>
      </Content>
      <QuestionsModalForm
        categories={categories}
        question={modalQuestionData}
        isVisible={modalQuestionIsVisible}
        onCancel={handleModalQuestionCancel}
        loadData={loadData}
      />
      <CategoryModalForm
        questions={questions}
        loadData={loadData}
        isVisible={modalCategoryIsVisible}
        category={modalCategoryData}
        onCancel={handleModalCategoryCancel}
      />
    </AdminPageLayout>
  );
}
