import { useContext } from 'react';
import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { useStudentData } from 'modules/Registry/hooks';
import { NoCourses, RegistrationForm, CourseCertificateAlert } from 'modules/Registry/components';
import { SessionContext } from 'modules/Course/contexts';

type Props = {
  courseAlias?: string;
};

export function StudentRegistry({ courseAlias }: Props) {
  const session = useContext(SessionContext);
  const { courses, loading, registered, steps, currentStep, form, handleSubmit, missingDisciplines } = useStudentData(
    session.githubId,
    courseAlias,
  );

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

  return <RegistrationPageLayout loading={loading}>{content}</RegistrationPageLayout>;
}
