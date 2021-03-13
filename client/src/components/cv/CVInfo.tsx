import * as React from 'react';
import { Result, Switch, Typography } from 'antd';
import EditCV from './EditCV';
import ViewCV from './ViewCV';
import NoConsentViewCV from './NoConsentViewCV';

const { Text } = Typography;

type CVInfoProps = {
  ownerId?: string | string[];
  isOwner: boolean;
  errorOccured: boolean;
  opportunitiesConsent: boolean | null;
  editMode: boolean;
  switchView: (checked: boolean) => Promise<void>;
  withdrawConsent: (ownerId: string) => void;
  giveConsent: (ownerId: string) => void;
};

function CVInfo(props: CVInfoProps) {
  const {
    ownerId,
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

  if (ownerId === undefined || ownerId instanceof Array) {
    return <Result status="warning" title="This page doesn't exist" />;
  }

  if (isOwner) {
    if (opportunitiesConsent) {
      return (
        <>
          <Text className="hide-on-print">Switch view:</Text>
          <Switch
            className="hide-on-print"
            style={{ marginLeft: '5px' }}
            defaultChecked={!editMode}
            onChange={switchView}
            checkedChildren="CV view"
            unCheckedChildren="Edit view"
          />
          {editMode ? (
            <EditCV ownerId={ownerId} withdrawConsent={() => withdrawConsent(ownerId as string)} />
          ) : (
            <ViewCV ownerId={ownerId} />
          )}
        </>
      );
    } else {
      return <NoConsentViewCV isOwner={true} giveConsent={() => giveConsent(ownerId as string)} />;
    }
  } else {
    if (opportunitiesConsent) {
      return <ViewCV ownerId={ownerId} />;
    } else {
      return <NoConsentViewCV isOwner={false} />;
    }
  }
}

export default CVInfo;
