import { ResumeDto } from 'api';
import { transformInitialCvData } from '../../transformers/transformInitialCvData';
import { EditCV } from '../EditCv';
import { ViewCV } from '../ViewCv';
import { NoConsentView } from '../NoConsentView';

export type ResumeProps = {
  githubId: string;
  consent: boolean;
  error?: Error;
  data: ResumeDto | null;
  editMode: boolean;
  switchView: () => void;
  onRemoveConsent: () => void;
  onCreateConsent: () => void;
  onUpdateResume?: () => void;
};

export const EditViewCv = (props: ResumeProps) => {
  const { githubId, data, consent, editMode, switchView, onUpdateResume, onRemoveConsent, onCreateConsent } = props;

  if (!consent) {
    return <NoConsentView isOwner={true} giveConsent={onCreateConsent} />;
  }

  const { userData, contacts, visibleCourses, courses } = transformInitialCvData(data);

  const editing = editMode || data == null;

  return (
    <>
      {editing ? (
        <EditCV
          courses={courses}
          userData={userData}
          contacts={contacts}
          visibleCourses={visibleCourses}
          onUpdateResume={onUpdateResume}
          githubId={githubId}
          onRemoveConsent={onRemoveConsent}
          switchView={switchView}
        />
      ) : (
        <ViewCV onRemoveConsent={onRemoveConsent} switchView={switchView} initialData={data} />
      )}
    </>
  );
};
