import { Divider, Layout } from 'antd';
import dynamic from 'next/dynamic';
import { Header } from '@client/shared/components/Header';

import { Steps } from './Steps';
import { StudentInfo } from './StudentInfo';
import { SubHeader } from './SubHeader';
import { StepContextProvider } from './StepContext';
import { StepsContent } from './StepsContent';
import { featureToggles } from 'services/features';
import { StageFeedbackProps } from '../../data';

const LegacyTechScreening = dynamic(() => import('pages/course/mentor/interview-technical-screening'), {
  loading: () => <p>Loading...</p>,
});

export function StageInterviewFeedback(props: StageFeedbackProps) {
  const { student, courseSummary, interviewFeedback, course, interviewId, type } = props;

  const shouldFallbackToLegacy = !featureToggles.feedback || interviewFeedback.version === 0;

  // if the feedback exists and doesn't have a version, it means it was created before the feedback feature was released
  // fallback to previous form. Once we migrate old data to new format(Artsiom A.), we may remove this fallback
  if (shouldFallbackToLegacy) {
    return <LegacyTechScreening />;
  }

  return (
    <Layout style={{ background: 'transparent', minHeight: '100vh' }}>
      <Header title="Technical screening" showCourseName />
      <SubHeader isCompleted={interviewFeedback.isCompleted ?? false} />
      <StepContextProvider
        interviewFeedback={interviewFeedback}
        course={course}
        interviewId={interviewId}
        type={type}
        interviewMaxScore={interviewFeedback.maxScore}
      >
        <Layout style={{ background: 'transparent' }}>
          <Layout.Content>
            <StepsContent />
          </Layout.Content>
          <Layout.Sider
            reverseArrow
            theme="light"
            width={400}
            style={{ borderLeft: '1px solid rgba(240, 242, 245)' }}
            breakpoint="md"
            collapsedWidth={0}
          >
            <StudentInfo student={student} courseSummary={courseSummary} />
            <Divider style={{ margin: 0 }} />
            <Steps />
          </Layout.Sider>
        </Layout>
      </StepContextProvider>
    </Layout>
  );
}
