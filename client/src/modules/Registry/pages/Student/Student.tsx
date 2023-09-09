import { useContext } from 'react';
import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { useStudentData } from 'modules/Registry/hooks';
import { NoCourses, RegistrationForm } from 'modules/Registry/components';
import { SessionContext } from 'modules/Course/contexts';

type Props = {
  courseAlias?: string;
};

export function StudentRegistry({ courseAlias }: Props) {
  const session = useContext(SessionContext);
  const { courses, loading, registered, steps, currentStep, form, handleSubmit } = useStudentData(
    session.githubId,
    courseAlias,
  );

  let content: React.ReactNode;
  if (loading || registered) {
    content = null;
  } else if (!courses.length) {
    content = <NoCourses />;
  } else {
    content = (
      <RegistrationForm
        form={form}
        handleSubmit={handleSubmit}
        steps={steps}
        currentStep={currentStep}
        type="student"
      />
    );
  }

  return (
    <RegistrationPageLayout loading={loading} githubId={session.githubId}>
      {content}
    </RegistrationPageLayout>
  );
}
