import * as React from 'react';
import { Result, Switch, Typography, Divider } from 'antd';
import EditCV from '../../../components/cv/EditCV';
import ViewCV from './ViewCV';
import NoConsentViewCV from '../../../components/cv/NoConsentViewCV';

const { Text } = Typography;

type ResumeProps = {
  hasPriorityRole: boolean;
  ownerGithubId?: string;
  isOwner: boolean;
  notFound: boolean;
  consent: boolean;
  editMode: boolean;
  switchView: (checked: boolean) => Promise<void>;
  withdrawConsent: (ownerGithubId: string) => void;
  giveConsent: (ownerGithubId: string) => void;
};

export function Resume(props: ResumeProps) {
  const {
    hasPriorityRole,
    ownerGithubId,
    isOwner,
    notFound,
    consent,
    editMode,
    switchView,
    withdrawConsent,
    giveConsent,
  } = props;

  if (ownerGithubId === undefined) {
    return <Result status="warning" title="This page doesn't exist" />;
  }

  if (!isOwner && !hasPriorityRole) {
    return <Result status="403" title="Sorry, but you don't have access to this page" />;
  }

  if (notFound) {
    return <Result status={404} title="User not found" />;
  }

  if (isOwner) {
    if (consent) {
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
          {editMode ? (
            <EditCV ownerGithubId={ownerGithubId} withdrawConsent={() => withdrawConsent(ownerGithubId as string)} />
          ) : (
            <ViewCV githubId={ownerGithubId} />
          )}
        </>
      );
    }
    return <NoConsentViewCV isOwner={true} giveConsent={() => giveConsent(ownerGithubId as string)} />;
  }

  if (consent) {
    return <ViewCV githubId={ownerGithubId} />;
  }
  return <NoConsentViewCV isOwner={false} />;
}
