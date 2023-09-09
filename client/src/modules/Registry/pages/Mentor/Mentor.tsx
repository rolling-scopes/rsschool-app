import { RegistrationPageLayout } from 'components/RegistrationPageLayout';
import { RegistrationForm } from 'modules/Registry/components';
import { useMentorData } from 'modules/Registry/hooks';

type Props = {
  courseAlias?: string | string[];
};

export function MentorRegistry({ courseAlias }: Props) {
  const { resume, loading, currentStep, steps, form, handleSubmit } = useMentorData(courseAlias);

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
