import { useEffect, useMemo, useState } from 'react';
import { List, Button, Form } from 'antd';
import { ReadOutlined, FileAddOutlined } from '@ant-design/icons';
import isEqual from 'lodash/isEqual';
import CommonCardWithSettingsModal from './CommonCardWithSettingsModal';
import { EmploymentRecordDto, UpdateProfileInfoDto } from 'api';
import EmploymentHistoryFormItem from './EmploymentHistory/EmploymentHistoryFormItem';
import EmploymentHistoryDisplayItem from './EmploymentHistory/EmploymentHistoryDisplayItem';
import dayjs from 'dayjs';

export type EmploymentRecordFormItem = Omit<EmploymentRecordDto, 'dateFrom' | 'dateTo'> & {
  dateFrom: dayjs.Dayjs;
  dateTo: dayjs.Dayjs;
};

type Props = {
  data: EmploymentRecordDto[];
  isEditingModeEnabled: boolean;
  updateProfile: (data: UpdateProfileInfoDto) => Promise<boolean>;
};

const dateFormat = 'YYYY-MM-DD';

const defaultEmploymentRecord: EmploymentRecordDto = {
  title: '',
  dateFrom: '',
  dateTo: '',
  toPresent: false,
  companyName: '',
  location: undefined,
};

const employmentRecordFormItemToDto = (employment: EmploymentRecordFormItem): EmploymentRecordDto => ({
  ...employment,
  dateFrom: employment.dateFrom.format(dateFormat),
  dateTo: employment.toPresent ? '' : employment.dateTo.format(dateFormat),
});

const employmentRecordDtoToFormItem = (employment: EmploymentRecordDto): EmploymentRecordFormItem => ({
  ...employment,
  dateFrom: employment.dateFrom ? dayjs(employment.dateFrom) : dayjs(),
  dateTo: employment.dateTo ? dayjs(employment.dateTo) : dayjs(),
});

const EmploymentCard = ({ isEditingModeEnabled, data, updateProfile }: Props) => {
  const [form] = Form.useForm<{ employmentHistory: EmploymentRecordFormItem[] }>();
  const values = Form.useWatch([], form);

  const [displayEmployments, setDisplayEmployments] = useState<EmploymentRecordFormItem[]>(
    data.map(employmentRecordDtoToFormItem),
  );
  const [employments, setEmployments] = useState<EmploymentRecordFormItem[]>(displayEmployments);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const isAddDisabled = useMemo(() => !!employments.length && !isFormValid, [employments, isFormValid]);

  useEffect(() => {
    if (!values || !Object.values(values).every(Boolean)) {
      return;
    }

    form.validateFields({ validateOnly: true }).then(
      () => {
        setIsFormValid(true);
      },
      () => {
        setIsFormValid(false);
      },
    );
  }, [values]);

  useEffect(() => {
    const readyToUpdate = !isEqual(displayEmployments, employments) && isFormValid;
    setIsSaveDisabled(!readyToUpdate);
  }, [displayEmployments, employments, isFormValid]);

  const handleSave = async () => {
    const employmentHistory = employments;
    const isUpdated = await updateProfile({
      employmentHistory: employmentHistory.map(employmentRecordFormItemToDto),
    });

    if (!isUpdated) {
      return;
    }

    setDisplayEmployments(employments);
  };

  const handleCancel = () => {
    form.setFieldsValue({ employmentHistory: displayEmployments });
    setEmployments(displayEmployments);
  };

  const renderContentItem = ({ title, dateFrom, dateTo, toPresent, companyName }: EmploymentRecordFormItem) => (
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
        <Form
          layout="vertical"
          form={form}
          onValuesChange={(_, { employmentHistory }) => setEmployments(employmentHistory)}
          initialValues={{ employmentHistory: employments }}
          style={{ width: '100%' }}
          requiredMark="optional"
        >
          <Form.List name="employmentHistory">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <EmploymentHistoryFormItem key={key} name={name} restField={restField} remove={remove} form={form} />
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add(defaultEmploymentRecord);
                    }}
                    block
                    icon={<FileAddOutlined />}
                    disabled={isAddDisabled}
                  >
                    Add new employment
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      }
    />
  );
};

export default EmploymentCard;
