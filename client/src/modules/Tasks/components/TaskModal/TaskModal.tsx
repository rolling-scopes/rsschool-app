import { Row, Col, Form, Input, Select, Card, Space, Tag, Empty, Typography } from 'antd';
import { Dispatch, SetStateAction, useMemo } from 'react';
import union from 'lodash/union';
import { TaskDto, CriteriaDto, DisciplineDto } from '@client/api';
import { ModalForm } from '@client/shared/components/Forms';
import { stringSorter } from '@client/shared/components/Table';
import { SKILLS } from 'data/skills';
import { TASK_TYPES } from 'data/taskTypes';
import { ModalFormMode } from 'hooks';
import { TaskSettings } from 'modules/Tasks/components';
import { ERROR_MESSAGES, LABELS, MODAL_TITLES, PLACEHOLDERS } from 'modules/Tasks/constants';
import { FormValues } from 'modules/Tasks/types';
import { urlPattern } from 'services/validators';

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
  const [form] = Form.useForm<FormValues>();
  const typeField = Form.useWatch('type', form);

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
    // reset settings
    form.setFieldsValue({
      githubPrRequired: undefined,
      githubRepoName: undefined,
      sourceGithubRepoUrl: undefined,
      attributes: undefined,
    });
    setDataCriteria([]);
  };

  return (
    <ModalForm
      data={formData ?? {}}
      form={form}
      title={MODAL_TITLES[mode]}
      submit={handleModalSubmit}
      cancel={() => {
        toggleModal();
        setDataCriteria([]);
      }}
      loading={modalLoading}
    >
      <Form.Item name="name" label={LABELS.name} rules={[{ required: true, message: ERROR_MESSAGES.name }]}>
        <Input placeholder={PLACEHOLDERS.name} />
      </Form.Item>
      <Form.Item
        name="descriptionUrl"
        label={LABELS.descriptionUrl}
        rules={[
          {
            required: true,
            message: ERROR_MESSAGES.descriptionUrl,
          },
          {
            message: ERROR_MESSAGES.validUrl,
            pattern: urlPattern,
          },
        ]}
      >
        <Input placeholder={PLACEHOLDERS.descriptionUrl} />
      </Form.Item>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name="type" label={LABELS.taskType} rules={[{ required: true, message: ERROR_MESSAGES.taskType }]}>
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
    </ModalForm>
  );
}
