import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { RegistrationForm } from 'modules/Registry/components';
import { useMentorData } from 'modules/Registry/hooks';
import { useRouter } from 'next/router';

export function MentorRegistry() {
  const router = useRouter();
  const { resume, loading, currentStep, steps, form, handleSubmit } = useMentorData(
    router.query.course as string | undefined,
  );

  return (
    <RegistrationPageLayout loading={loading}>
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
