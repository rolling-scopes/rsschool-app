import { Divider, Result, Switch, Typography } from 'antd';
import { ResumeDto } from 'api';
import EditCV from '../../../components/cv/EditCV';
import NoConsentViewCV from '../../../components/cv/NoConsentViewCV';
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
};

export function EditViewResume(props: ResumeProps) {
  const { githubId, data, error, consent, editMode, switchView, onRemoveConsent, onCreateConsent } = props;

  if (!consent) {
    return <NoConsentViewCV isOwner={true} giveConsent={onCreateConsent} />;
  }

  if (error) {
    return <Result status="error" title="Error" subTitle={error.message} />;
  }

  const edititing = editMode || data === null;

  return (
    <>
      <Divider className="no-print" plain>
        <Text style={{ verticalAlign: 'middle' }}>Switch view:</Text>
        <Switch
          disabled={data === null}
          style={{ marginLeft: '5px' }}
          defaultChecked={!editMode}
          onChange={switchView}
          checkedChildren="CV view"
          unCheckedChildren="Edit view"
        />
      </Divider>
      {edititing ? <EditCV githubId={githubId} withdrawConsent={onRemoveConsent} /> : <ViewCV initialData={data} />}
    </>
  );
}
