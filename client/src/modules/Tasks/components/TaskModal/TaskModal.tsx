import { Row, Col, Form, Input, Select, Card, Space, Tag, Empty, Typography, Modal, Button } from 'antd';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import union from 'lodash/union';
import { TaskDto, CriteriaDto, DisciplineDto } from 'api';

import { stringSorter } from 'components/Table';
import { SKILLS } from 'data/skills';
import { TASK_TYPES } from 'data/taskTypes';
import { ModalFormMode } from 'hooks';
import { TaskSettings } from 'modules/Tasks/components';
import { ERROR_MESSAGES, LABELS, MODAL_TITLES, PLACEHOLDERS } from 'modules/Tasks/constants';
import { FormValues } from 'modules/Tasks/types';
import { urlPattern } from 'services/validators';
import { SplitCancelModalForm } from 'components/Forms/SplitCancelModalForm';
const { Text } = Typography;
const { TextArea } = Input;

const taskTypes = TASK_TYPES.sort(stringSorter('name')).map(({ id, name }) => ({ value: id, label: name }));

export type ModalProps = {
  tasks: TaskDto[];
  formData: FormValues | undefined;
  dataCriteria: CriteriaDto[];
  modalLoading: boolean;
  disciplines: DisciplineDto[];
  mode: ModalFormMode;
  toggleModal: (data?: FormValues) => void;
  setDataCriteria: Dispatch<SetStateAction<CriteriaDto[]>>;
  handleModalSubmit: (values: FormValues) => Promise<void>;
};

export function TaskModal({
  tasks,
  dataCriteria,
  modalLoading,
  disciplines,
  mode,
  formData,
  toggleModal,
  setDataCriteria,
  handleModalSubmit,
}: ModalProps) {
  if (!formData) {
    return null;
  }

  const [form] = Form.useForm<FormValues>();
  const typeField = Form.useWatch('type', form);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const allTags = useMemo(() => union(...tasks.map(task => task.tags || [])), [tasks]);
  const allSkills = useMemo(
    () =>
      union(
        tasks
          .flatMap(task => task.skills || [])
          .concat(SKILLS)
          .sort(),
      ),
    [tasks],
  );

  const handleTypeChange = () => {
    form.setFieldsValue({
      githubPrRequired: undefined,
      githubRepoName: undefined,
      sourceGithubRepoUrl: undefined,
      attributes: undefined,
    });
    setDataCriteria([]);
  };

  const handleCloseActions = () => {
    const isDirty = form.isFieldsTouched();
    if (isDirty) {
      setConfirmVisible(true);
    } else {
      toggleModal();
      setDataCriteria([]);
      form.resetFields();
    }
  };

  const handleFooterCancel = () => {
    toggleModal();
    setDataCriteria([]);
    form.resetFields();
  };

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    try {
      const values = await form.validateFields();
      await handleModalSubmit(values);
      setConfirmVisible(false);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Validation or submission failed:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseWithoutSaving = () => {
    setConfirmVisible(false);
    toggleModal();
    setDataCriteria([]);
    form.resetFields();
  };

  return (
    <>
      <SplitCancelModalForm
        form={form}
        data={formData}
        title={MODAL_TITLES[mode]}
        loading={modalLoading}
        submit={handleModalSubmit}
        onCancel={handleCloseActions}
        resetOnCancel={false}
        onFooterCancel={handleFooterCancel}
      >
        <Form.Item name="name" label={LABELS.name} rules={[{ required: true, message: ERROR_MESSAGES.name }]}>
          <Input placeholder={PLACEHOLDERS.name} />
        </Form.Item>
        <Form.Item
          name="descriptionUrl"
          label={LABELS.descriptionUrl}
          rules={[
            { required: true, message: ERROR_MESSAGES.descriptionUrl },
            { message: ERROR_MESSAGES.validUrl, pattern: urlPattern },
          ]}
        >
          <Input placeholder={PLACEHOLDERS.descriptionUrl} />
        </Form.Item>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="type"
              label={LABELS.taskType}
              rules={[{ required: true, message: ERROR_MESSAGES.taskType }]}
            >
              <Select placeholder={PLACEHOLDERS.taskType} options={taskTypes} onChange={handleTypeChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="discipline"
              label={LABELS.discipline}
              rules={[{ required: true, message: ERROR_MESSAGES.discipline }]}
            >
              <Select
                placeholder={PLACEHOLDERS.discipline}
                options={disciplines.map(({ id, name }) => ({ value: id, label: name }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="tags" label={LABELS.tags}>
              <Select
                mode="tags"
                placeholder={PLACEHOLDERS.tags}
                options={allTags.map(tag => ({ value: tag, label: tag }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="skills" label={LABELS.skills}>
              <Select
                mode="tags"
                placeholder={PLACEHOLDERS.skills}
                options={allSkills.map(tag => ({ value: tag, label: tag }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label={LABELS.summary}>
          <TextArea placeholder={PLACEHOLDERS.summary} maxLength={100} showCount />
        </Form.Item>
        <Row gutter={24}>
          <Col span={24}>
            <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 24 }}>
              <Text>{LABELS.usedInCourses}</Text>
              <Card bodyStyle={{ padding: 8 }}>
                {formData?.courses?.length ? (
                  <Space size={[0, 8]} wrap>
                    {formData.courses.map(({ name, isActive }) => (
                      <Tag key={name} color={isActive ? 'blue' : ''}>
                        {name}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />
                )}
              </Card>
            </Space>
          </Col>
        </Row>
        <TaskSettings dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} taskType={typeField} />
      </SplitCancelModalForm>

      <Modal
        title="You have unsaved changes"
        open={isConfirmVisible}
        onCancel={() => setConfirmVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmVisible(false)}>
            Keep Editing
          </Button>,
          <Button key="dont_save" danger onClick={handleCloseWithoutSaving}>
            Close without saving
          </Button>,
          <Button key="save" type="primary" loading={isSaving} onClick={handleSaveAndClose}>
            Save and close
          </Button>,
        ]}
      >
        <p>Do you want to save your changes before closing?</p>
      </Modal>
    </>
  );
}
