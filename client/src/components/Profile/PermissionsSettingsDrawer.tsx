import * as React from 'react';
import { toPairs, mapValues, values } from 'lodash';
import { ConfigurableProfilePermissions } from 'common/models/profile';
import { Drawer, Checkbox, List, Typography } from 'antd';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Text } = Typography;

type Props = {
  isSettingsVisible: boolean;
  hideSettings: () => void;
  onPermissionsSettingsChange?: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  permissionsSettings?: Partial<ConfigurableProfilePermissions>;
};

enum permissionNames {
  isProfileVisible = 'Who can see my profile?',
  isAboutVisible = 'About',
  isEducationVisible = 'Education info',
  isEnglishVisible = 'English level',
  isEmailVisible = 'Email',
  isTelegramVisible = 'Telegram',
  isSkypeVisible = 'Skype',
  isPhoneVisible = 'Phone',
  isContactsNotesVisible = 'Contact notes',
  isLinkedInVisible = 'Link to LinkedIn profile',
  isPublicFeedbackVisible = 'Public feedback',
  isMentorStatsVisible = 'Mentor statistics',
  isStudentStatsVisible = 'Student statistics',
}

enum roles {
  all = 'Everybody',
  mentor = 'Mentor assigned (who can check your tasks or interview)',
  student = 'Student assigned to you (if you are a mentor)',
}

function PermissionsSettingsDrawer(props: Props) {
  const { isSettingsVisible, hideSettings, permissionsSettings, onPermissionsSettingsChange } = props;
  return (
    <>
      <Drawer
        title="Visibility settings"
        placement="top"
        closable={true}
        onClose={hideSettings}
        visible={isSettingsVisible}
        getContainer={false}
        style={{ position: 'absolute', display: isSettingsVisible ? 'block' : 'none' }}
      >
        <List
          itemLayout="horizontal"
          dataSource={toPairs(permissionsSettings)}
          renderItem={([permissionName, actualPermissions]) => (
            <List.Item>
              <div>
                <p style={{ fontSize: 18, marginBottom: 5 }}>
                  <Text strong>{(permissionNames as any)[permissionName]}</Text>
                </p>
                {values(
                  mapValues(actualPermissions, (isChecked, role) => (
                    <p key={`visibility-settings-${permissionName}-${role}`} style={{ marginBottom: 0 }}>
                      <Checkbox
                        checked={isChecked}
                        style={{ fontSize: 12 }}
                        onChange={
                          onPermissionsSettingsChange
                            ? event => onPermissionsSettingsChange(event, { permissionName, role })
                            : undefined
                        }
                      >
                        {(roles as any)[role]}
                      </Checkbox>
                    </p>
                  )),
                )}
              </div>
            </List.Item>
          )}
        />
      </Drawer>
      <style jsx>{`
        :global(.ant-drawer-content-wrapper) {
          height: inherit !important;
        }

        :global(.ant-drawer-wrapper-body) {
          overflow: hidden;
        }

        :global(.ant-drawer-body) {
          height: calc(100% - 55px);
          overflow: auto;
        }
      `}</style>
    </>
  );
}

export default PermissionsSettingsDrawer;
