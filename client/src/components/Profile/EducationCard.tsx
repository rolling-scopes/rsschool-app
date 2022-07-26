import React, { ChangeEvent, useMemo, useState } from 'react';
import { Typography, List, Input, Button } from 'antd';
import { ReadOutlined, FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import CommonCardWithSettingsModal from './CommonCardWithSettingsModal';
import { Education, ProfileApi } from 'api';
import { onSaveError, onSaveSuccess } from 'utils/profileMessengers';

const { Text } = Typography;

type UniversityProps = {
  university: string | null;
  faculty: string | null;
  graduationYear: number | string | null;
};

type Props = {
  data: UniversityProps[];
  isEditingModeEnabled: boolean;
};

const profileApi = new ProfileApi();

const EducationCard = ({ isEditingModeEnabled, data }: Props) => {
  const [displayUniversities, setDisplayUniversities] = useState(data);
  const [universities, setUniversities] = useState(displayUniversities);
  const isDisabled = useMemo(
    () =>
      !!universities.length &&
      universities.some(({ university, faculty, graduationYear }) => !university || !faculty || !graduationYear),
    [universities],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>, field: keyof UniversityProps, index: number) => {
    const { value } = e.target;

    setUniversities(prev => {
      const university = prev[index];
      university[field] = value;
      return [...prev];
    });
  };

  const handleSave = async () => {
    const educationHistory = universities as Education[];
    try {
      await profileApi.updateProfileInfoFlat({ educationHistory });
      setDisplayUniversities(universities);
      onSaveSuccess();
    } catch (error) {
      onSaveError();
    }
  };

  const handleCancel = () => {
    setUniversities(displayUniversities);
  };

  const addUniversity = () => {
    const emptyUniversity = {
      university: null,
      faculty: null,
      graduationYear: null,
    };

    setUniversities(prev => [...prev, emptyUniversity]);
  };

  const handleDelete = (index: number) => {
    setUniversities(prev => prev.filter((_, i) => i !== index));
  };

  const renderSettingsItem = ({ graduationYear, university, faculty }: UniversityProps, index: number) => {
    const fields = [
      {
        label: 'University:',
        value: university ?? '',
        onChange: (event: ChangeEvent<HTMLInputElement>) => handleChange(event, 'university', index),
      },
      {
        label: 'Faculty:',
        value: faculty ?? '',
        onChange: (event: ChangeEvent<HTMLInputElement>) => handleChange(event, 'faculty', index),
      },
      {
        label: 'Graduation year:',
        value: graduationYear ?? '',
        onChange: (event: ChangeEvent<HTMLInputElement>) => handleChange(event, 'graduationYear', index),
      },
    ];

    return (
      <List.Item>
        <div style={{ width: '100%' }}>
          <p style={{ marginBottom: 5 }}>
            {university && faculty && graduationYear ? (
              <>
                <Text strong>{graduationYear}</Text> {`${university} / ${faculty}`}
              </>
            ) : (
              '(Empty)'
            )}
          </p>
          <p style={{ marginBottom: 10 }}>
            <Button size="small" type="dashed" onClick={() => handleDelete(index)}>
              <DeleteOutlined /> Delete
            </Button>
          </p>
          {fields.map(({ label, value, onChange }, id) => (
            <label key={id} style={{ fontSize: 18, marginBottom: 10, display: 'block' }}>
              <Text style={{ fontSize: 18, marginBottom: 5, display: 'block' }} strong>
                {label}
              </Text>
              <Input value={value} style={{ width: '100%' }} onChange={onChange} />
            </label>
          ))}
        </div>
      </List.Item>
    );
  };

  const renderContentItem = ({ graduationYear, university, faculty }: UniversityProps) => (
    <List.Item>
      <p>
        {graduationYear && university && faculty ? (
          <>
            <Text strong>{graduationYear}</Text> {` ${university} / ${faculty}`}
          </>
        ) : (
          '(Empty)'
        )}
      </p>
    </List.Item>
  );

  return (
    <CommonCardWithSettingsModal
      title="Education"
      icon={<ReadOutlined />}
      noDataDescription="Education history isn't filled in"
      isEditingModeEnabled={isEditingModeEnabled}
      saveProfile={handleSave}
      cancelChanges={handleCancel}
      isSaveDisabled={isDisabled}
      content={
        displayUniversities.length ? (
          <List itemLayout="horizontal" dataSource={displayUniversities} renderItem={renderContentItem} />
        ) : null
      }
      profileSettingsContent={
        <>
          <List itemLayout="horizontal" dataSource={universities} renderItem={renderSettingsItem} />
          <Button type="dashed" style={{ width: '100%' }} onClick={addUniversity} disabled={isDisabled}>
            <FileAddOutlined /> Add new university
          </Button>
        </>
      }
    />
  );
};

export default EducationCard;
