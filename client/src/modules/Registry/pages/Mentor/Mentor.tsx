import { useContext } from 'react';
import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { RegistrationForm } from 'modules/Registry/components';
import { useMentorData } from 'modules/Registry/hooks';

type Props = {
  courseAlias?: string | string[];
};

export function MentorRegistry({ courseAlias }: Props) {
  const { githubId } = useContext(SessionContext);
  const { resume, loading, currentStep, steps, form, handleSubmit } = useMentorData(courseAlias);

  return (
    <RegistrationPageLayout loading={loading} githubId={githubId}>
      {resume ? (
        <RegistrationForm
          form={form}
          handleSubmit={handleSubmit}
          steps={steps}
          currentStep={currentStep}
          initialValues={resume}
        />
      ) : null}
    </RegistrationPageLayout>
  );
}
