import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { Session } from 'components/withSession';
import { RegistrationForm } from 'modules/Registry/components';
import { useMentorData } from 'modules/Registry/hooks';

type Props = {
  session: Session;
  courseAlias?: string;
};

export function MentorRegistry({ courseAlias, session }: Props) {
  const { resume, loading, currentStep, steps, form, handleSubmit } = useMentorData(courseAlias);

  return (
    <RegistrationPageLayout loading={loading} githubId={session.githubId}>
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
