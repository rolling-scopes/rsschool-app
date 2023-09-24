import React, { useEffect, useMemo, useState } from 'react';
import { List, Button } from 'antd';
import { ReadOutlined, FileAddOutlined } from '@ant-design/icons';
import isEqual from 'lodash/isEqual';
import CommonCardWithSettingsModal from './CommonCardWithSettingsModal';
import { EmploymentRecordDto, UpdateProfileInfoDto } from 'api';
import EmploymentHistoryItemForm from './EmploymentHistory/EmploymentHistoryItemForm';
import EmploymentHistoryDisplayItem from './EmploymentHistory/EmploymentHistoryDisplayItem';

type Props = {
  data: EmploymentRecordDto[];
  isEditingModeEnabled: boolean;
  updateProfile: (data: UpdateProfileInfoDto) => Promise<boolean>;
};

const hasEmptyFields = (employments: EmploymentRecordDto[]) =>
  employments.some(
    ({ title, dateFrom, dateTo, toPresent, companyName, officeLocation }) =>
      !title || !dateFrom || !companyName || !officeLocation || !(toPresent || dateTo),
  );

const EmploymentCard = ({ isEditingModeEnabled, data, updateProfile }: Props) => {
  const [displayEmployments, setDisplayEmployments] = useState<EmploymentRecordDto[]>(data);
  const [employments, setEmployments] = useState<EmploymentRecordDto[]>(displayEmployments);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const isAddDisabled = useMemo(() => !!employments.length && hasEmptyFields(employments), [employments]);

  useEffect(() => {
    const readyToUpdate = !isEqual(displayEmployments, employments) && !hasEmptyFields(employments);
    setIsSaveDisabled(!readyToUpdate);
  }, [displayEmployments, employments]);

  const handleChange = (
    { title, dateFrom, dateTo, toPresent, companyName, officeLocation }: EmploymentRecordDto,
    index: number,
  ) => {
    setEmployments([
      ...employments.slice(0, index),
      {
        title,
        dateFrom: dateFrom.valueOf(),
        dateTo: dateTo.valueOf(),
        toPresent,
        companyName,
        officeLocation,
      },
      ...employments.slice(index + 1),
    ]);
  };

  const handleSave = async () => {
    const employmentHistory = employments;
    const isUpdated = await updateProfile({ employmentHistory });

    if (!isUpdated) {
      return;
    }

    setDisplayEmployments(employments);
  };

  const handleCancel = () => {
    setEmployments(displayEmployments);
  };

  const addEmployment = () => {
    const emptyEmployment = {
      title: '',
      dateFrom: '',
      dateTo: '',
      toPresent: false,
      companyName: '',
      officeLocation: '',
    };

    setEmployments(prev => [...prev, emptyEmployment]);
  };

  const handleDelete = (index: number) => {
    setEmployments(prev => prev.filter((_, i) => i !== index));
  };

  const renderSettingsItem = (
    { title, dateFrom, dateTo, toPresent, companyName, officeLocation }: EmploymentRecordDto,
    index: number,
  ) => (
    <List.Item>
      <EmploymentHistoryItemForm
        employmentRecord={{ title, dateFrom, dateTo, toPresent, companyName, officeLocation }}
        index={index}
        handleChange={handleChange}
        handleDelete={handleDelete}
      />
    </List.Item>
  );

  const renderContentItem = ({ title, dateFrom, dateTo, toPresent, companyName }: EmploymentRecordDto) => (
    <List.Item>
      <EmploymentHistoryDisplayItem employmentRecord={{ title, dateFrom, dateTo, toPresent, companyName }} />
    </List.Item>
  );

  return (
    <CommonCardWithSettingsModal
      title="Employment"
      icon={<ReadOutlined />}
      noDataDescription="Employment history isn't filled in"
      isEditingModeEnabled={isEditingModeEnabled}
      saveProfile={handleSave}
      cancelChanges={handleCancel}
      isSaveDisabled={isSaveDisabled}
      content={
        displayEmployments.length ? (
          <List itemLayout="horizontal" dataSource={displayEmployments} renderItem={renderContentItem} />
        ) : null
      }
      profileSettingsContent={
        <>
          <List itemLayout="horizontal" dataSource={employments} renderItem={renderSettingsItem} />
          <Button type="dashed" style={{ width: '100%' }} onClick={addEmployment} disabled={isAddDisabled}>
            <FileAddOutlined /> Add new employment
          </Button>
        </>
      }
    />
  );
};

export default EmploymentCard;
