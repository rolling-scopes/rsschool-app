import * as React from 'react';
import { Result, Switch, Typography, Divider } from 'antd';
import EditCV from './EditCV';
import ViewCV from './ViewCV';
import NoConsentViewCV from './NoConsentViewCV';

const { Text } = Typography;

type CVInfoProps = {
  ownerGithubId?: string | string[];
  isOwner: boolean;
  errorOccured: boolean;
  opportunitiesConsent: boolean | null;
  editMode: boolean;
  switchView: (checked: boolean) => Promise<void>;
  withdrawConsent: (ownerGithubId: string) => void;
  giveConsent: (ownerGithubId: string) => void;
};

function CVInfo(props: CVInfoProps) {
  const {
    ownerGithubId,
    isOwner,
    errorOccured,
    opportunitiesConsent,
    editMode,
    switchView,
    withdrawConsent,
    giveConsent,
  } = props;

  if (errorOccured) {
    return <Result status={404} title="User not found" />;
  }

  if (ownerGithubId === undefined || ownerGithubId instanceof Array) {
    return <Result status="warning" title="This page doesn't exist" />;
  }

  if (isOwner) {
    if (opportunitiesConsent) {
      return (
        <>
          <Divider className="hide-on-print" plain>
            <Text style={{ verticalAlign: 'middle' }}>Switch view:</Text>
            <Switch
              style={{ marginLeft: '5px' }}
              defaultChecked={!editMode}
              onChange={switchView}
              checkedChildren="CV view"
              unCheckedChildren="Edit view"
            />
          </Divider>
          {editMode ? (
            <EditCV ownerGithubId={ownerGithubId} withdrawConsent={() => withdrawConsent(ownerGithubId as string)} />
          ) : (
            <ViewCV ownerGithubId={ownerGithubId} />
          )}
        </>
      );
    } else {
      return <NoConsentViewCV isOwner={true} giveConsent={() => giveConsent(ownerGithubId as string)} />;
    }
  } else {
    if (opportunitiesConsent) {
      return <ViewCV ownerGithubId={ownerGithubId} />;
    } else {
      return <NoConsentViewCV isOwner={false} />;
    }
  }
}

export default CVInfo;
