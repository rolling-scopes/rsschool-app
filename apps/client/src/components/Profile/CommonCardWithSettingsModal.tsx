import { ReactNode, useState } from 'react';
import ProfileSettingsModal from './ProfileSettingsModal';
import CommonCard from './CommonCard';

type Props = {
  profileSettingsContent: JSX.Element;
  isEditingModeEnabled: boolean;
  noDataDescription?: string;
  settingsTitle?: string;
  title: string;
  icon: JSX.Element;
  content: JSX.Element | null;
  actions?: ReactNode[];
  isSaveDisabled?: boolean;
  saveProfile: () => void;
  cancelChanges: () => void;
};

const CommonCardWithSettingsModal = ({
  title,
  icon,
  content,
  profileSettingsContent,
  isEditingModeEnabled,
  noDataDescription,
  settingsTitle,
  actions,
  isSaveDisabled,
  saveProfile,
  cancelChanges,
}: Props) => {
  const [isProfileSettingsVisible, setIsProfileSettingsVisible] = useState(false);

  const showProfileSettings = () => {
    setIsProfileSettingsVisible(true);
  };

  const hideProfileSettings = () => {
    setIsProfileSettingsVisible(false);
  };

  const onSave = () => {
    saveProfile();
    hideProfileSettings();
  };

  const onCancel = () => {
    cancelChanges();
    hideProfileSettings();
  };

  return (
    <>
      <CommonCard
        title={title}
        noDataDescription={noDataDescription}
        icon={icon}
        actions={actions}
        content={content}
        handleEdit={isEditingModeEnabled ? showProfileSettings : undefined}
      />
      {isEditingModeEnabled ? (
        <ProfileSettingsModal
          isSettingsVisible={isProfileSettingsVisible}
          settingsTitle={settingsTitle}
          content={profileSettingsContent}
          onSave={onSave}
          onCancel={onCancel}
          isSaveDisabled={isSaveDisabled}
        />
      ) : null}
    </>
  );
};

export default CommonCardWithSettingsModal;
