import { ChangeEvent, useEffect, useState } from 'react';
import { Card, Typography, Input, Row, Col } from 'antd';
import { GithubFilled, EnvironmentFilled, EditOutlined } from '@ant-design/icons';
import isEqual from 'lodash/isEqual';
import { GithubAvatar } from 'components/GithubAvatar';
import { LocationSelect } from 'components/Forms';
import { Location } from 'common/models/profile';
import ProfileSettingsModal from './ProfileSettingsModal';
import { UpdateProfileInfoDto } from 'api';
import { ProfileMainCardData } from 'services/user';

const { Title, Paragraph, Text } = Typography;

type Props = {
  data: ProfileMainCardData;
  isEditingModeEnabled: boolean;
  updateProfile: (data: UpdateProfileInfoDto) => Promise<boolean>;
};

const MainCard = ({ data, isEditingModeEnabled, updateProfile }: Props) => {
  const { githubId, name, location, publicCvUrl } = data;
  const [isProfileSettingsVisible, setIsProfileSettingsVisible] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [displayName, setDisplayName] = useState(name);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [nameInputValue, setNameInputValue] = useState(displayName);
  const [locationSelectValue, setLocationSelectValue] = useState(displayLocation);

  const showProfileSettings = () => {
    setIsProfileSettingsVisible(true);
  };

  const hideProfileSettings = () => {
    setIsProfileSettingsVisible(false);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNameInputValue(e.target.value);
  };

  const handleLocationChange = (value: Location | null) => {
    setLocationSelectValue(value);
  };

  const onSave = async () => {
    const isNameChanged = displayName !== nameInputValue;
    const isLocationChanged = !isEqual(displayLocation, locationSelectValue);
    const updateProfileDto: UpdateProfileInfoDto = {};

    if (isNameChanged) {
      updateProfileDto.name = nameInputValue;
    }

    if (isLocationChanged) {
      updateProfileDto.cityName = locationSelectValue?.cityName ?? null;
      updateProfileDto.countryName = locationSelectValue?.countryName ?? null;
    }

    const isUpdated = await updateProfile(updateProfileDto);

    if (isUpdated) {
      setDisplayName(nameInputValue);
      setDisplayLocation(locationSelectValue);
    }

    hideProfileSettings();
  };

  const onCancel = () => {
    setNameInputValue(displayName);
    setLocationSelectValue(displayLocation);
    hideProfileSettings();
  };

  useEffect(() => {
    const isNameChanged = displayName !== nameInputValue && nameInputValue?.trim();
    const isLocationChanged = !isEqual(displayLocation, locationSelectValue);
    const readyToUpdate = isNameChanged || isLocationChanged;

    setIsSaveDisabled(!readyToUpdate);
  }, [nameInputValue, locationSelectValue, displayName, displayLocation]);

  return (
    <>
      <Card style={{ position: 'relative' }}>
        {isEditingModeEnabled ? (
          <EditOutlined
            style={{ position: 'absolute', top: 18, right: 24, fontSize: 16 }}
            key="main-card-actions-edit"
            onClick={showProfileSettings}
          />
        ) : null}
        {githubId ? (
          <GithubAvatar size={96} githubId={githubId} style={{ margin: '0 auto 10px', display: 'block' }} />
        ) : null}
        <Title level={1} style={{ fontSize: 24, textAlign: 'center', margin: 0 }}>
          {displayName}
        </Title>

        <Paragraph style={{ textAlign: 'center', marginBottom: 20 }}>
          {githubId ? (
            <a target="_blank" href={`https://github.com/${githubId}`} style={{ fontSize: 16 }}>
              <GithubFilled /> {githubId}
            </a>
          ) : null}
        </Paragraph>

        <Paragraph style={{ textAlign: 'center', margin: 0 }}>
          {displayLocation ? (
            <span>
              <EnvironmentFilled /> {`${displayLocation.cityName}, ${displayLocation.countryName}`}
            </span>
          ) : null}
        </Paragraph>
        {publicCvUrl ? (
          <Paragraph style={{ textAlign: 'center', marginTop: 20 }}>
            <a target="_blank" href={publicCvUrl}>
              Public CV
            </a>
          </Paragraph>
        ) : null}
        {isEditingModeEnabled && (
          <ProfileSettingsModal
            isSettingsVisible={isProfileSettingsVisible}
            onCancel={onCancel}
            onSave={onSave}
            isSaveDisabled={isSaveDisabled}
            content={
              <Row>
                <Col style={{ width: '100%' }}>
                  <Row>
                    <Text strong>Name</Text>
                  </Row>
                  <Row style={{ marginTop: 4 }}>
                    <Input value={nameInputValue} placeholder="First-name Last-name" onChange={handleNameChange} />
                  </Row>
                  <Row style={{ marginTop: 24 }}>
                    <Text strong>Location</Text>
                  </Row>
                  <Row style={{ marginTop: 4 }}>
                    <LocationSelect
                      style={{ flex: 1 }}
                      onChange={handleLocationChange}
                      location={locationSelectValue}
                    />
                  </Row>
                </Col>
              </Row>
            }
          />
        )}
      </Card>
    </>
  );
};

export default MainCard;
