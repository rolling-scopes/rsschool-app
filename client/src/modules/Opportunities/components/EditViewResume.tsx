import { ResumeDto } from 'api';
import { transformCvData } from '../transformers/transformCvData';
import EditCV from './EditCV';
import { NoConsentView } from './NoConsentView';
import ViewCV from './ViewCV';

type ResumeProps = {
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

export function EditViewResume(props: ResumeProps) {
  const { githubId, data, consent, editMode, switchView, onUpdateResume, onRemoveConsent, onCreateConsent } = props;

  if (!consent) {
    return <NoConsentView isOwner={true} giveConsent={onCreateConsent} />;
  }

  const { userData, contacts, updatedDate, visibleCourses, courses } = transformCvData(data);

  const editing = editMode || data == null;

  return (
    <>
      {editing ? (
        <EditCV
          courses={courses}
          userData={userData}
          contacts={contacts}
          updatedAt={updatedDate}
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
}
