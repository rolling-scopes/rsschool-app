import { Divider, Switch, Typography } from 'antd';
import { ResumeDto } from 'api';
import EditCV from './EditCV';
import NoConsentViewCV from './NoConsentViewCV';
import ViewCV from './ViewCV';

const { Text } = Typography;

type ResumeProps = {
  githubId: string;
  consent: boolean;
  error?: Error;
  data: ResumeDto | null;
  editMode: boolean;
  switchView: (checked: boolean) => Promise<void>;
  onRemoveConsent: () => void;
  onCreateConsent: () => void;
  onUpdateResume?: () => void;
};

export function EditViewResume(props: ResumeProps) {
  const { githubId, data, consent, editMode, switchView, onUpdateResume, onRemoveConsent, onCreateConsent } = props;

  if (!consent) {
    return <NoConsentViewCV isOwner={true} giveConsent={onCreateConsent} />;
  }

  const editing = editMode || data == null;

  return (
    <>
      <Divider className="no-print" plain>
        <Text style={{ verticalAlign: 'middle' }}>Switch view:</Text>
        <Switch
          style={{ marginLeft: '5px' }}
          defaultChecked={!editMode}
          onChange={switchView}
          checkedChildren="CV view"
          unCheckedChildren="Edit view"
        />
      </Divider>
      {editing ? (
        <EditCV data={data} onUpdateResume={onUpdateResume} githubId={githubId} onRemoveConsent={onRemoveConsent} />
      ) : (
        <ViewCV initialData={data} />
      )}
    </>
  );
}
