import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { CourseCertificateAlert, NoCourses, RegistrationForm } from 'modules/Registry/components';
import { useStudentData } from 'modules/Registry/hooks';
import { useRouter } from 'next/router';
import { useContext } from 'react';

export function StudentRegistry() {
  const session = useContext(SessionContext);
  const router = useRouter();
  const { courses, loading, registered, steps, currentStep, form, handleSubmit, modalContext, missingDisciplines } =
    useStudentData(session.githubId, router.query.course as string | undefined);

  let content: React.ReactNode;
  if (loading || registered) {
    content = null;
  } else if (missingDisciplines && courses.length) {
    content = <CourseCertificateAlert certificateDiscipline={missingDisciplines} />;
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
    <RegistrationPageLayout loading={loading}>
      {modalContext}
      {content}
    </RegistrationPageLayout>
  );
}
