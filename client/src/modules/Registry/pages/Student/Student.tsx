import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { Session } from 'components/withSession';
import { useStudentData } from 'modules/Registry/hooks';
import { NoCourses, RegistrationForm } from 'modules/Registry/components';

type Props = {
  session: Session;
  courseAlias?: string;
};

export function StudentRegistry({ session, courseAlias }: Props) {
  const { githubId } = session;
  const { courses, loading, registered, steps, currentStep, form, handleSubmit } = useStudentData(
    githubId,
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
    <RegistrationPageLayout loading={loading} githubId={githubId}>
      {content}
    </RegistrationPageLayout>
  );
}
