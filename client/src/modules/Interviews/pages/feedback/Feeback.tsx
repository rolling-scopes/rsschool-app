import { Divider, Layout } from 'antd';
import { Header } from 'components/Header';
import { SessionContext } from 'modules/Course/contexts';
import { CourseNoAccess } from 'modules/Course/components/CourseNoAccess';
import { useContext } from 'react';
import { PageProps } from '../InterviewFeedback/getServerSideProps';

import { Steps } from './Steps';
import { StudentInfo } from './StudentInfo';
import { SubHeader } from './SubHeader';
import { StepContextProvider } from './StepContext';
import { DynamicForm } from './Form';

export function Feedback(props: PageProps) {
  const session = useContext(SessionContext);
  const { student, courseSummary } = props;

  if (!student) {
    return <CourseNoAccess />;
  }

  return (
    <Layout style={{ background: 'transparent', minHeight: '100vh' }}>
      <Header title="Technical screening" username={session.githubId} />
      {/* TODO: get completed value */}
      <SubHeader completed />
      <StepContextProvider stepsStatus={{}}>
        <Layout style={{ background: 'transparent' }}>
          <Layout.Content>
            <DynamicForm />
          </Layout.Content>
          <Layout.Sider theme="light" width={450} style={{ borderLeft: '1px solid rgba(240, 242, 245)' }}>
            <StudentInfo student={student} courseSummary={courseSummary} />
            <Divider style={{ margin: 0 }} />
            <Steps />
          </Layout.Sider>
        </Layout>
      </StepContextProvider>
    </Layout>
  );
}
