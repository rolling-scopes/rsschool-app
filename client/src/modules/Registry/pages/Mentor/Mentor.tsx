import { RegistrationPageLayout } from '@client/components/RegistrationPageLayout';
import { RegistrationForm } from '@client/modules/Registry/components';
import { useMentorData } from '@client/modules/Registry/hooks';
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
