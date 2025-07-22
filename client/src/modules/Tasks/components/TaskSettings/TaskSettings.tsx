import { Collapse, CollapseProps, Space, Typography } from 'antd';
import { CollapsibleType } from 'antd/es/collapse/CollapsePanel';
import { CriteriaDto, TaskDtoTypeEnum } from 'api';

import { CrossCheckTaskCriteriaPanel, GitHubPanel, JsonAttributesPanel } from 'modules/Tasks/components';
import { TASK_SETTINGS_HEADERS } from 'modules/Tasks/constants';
import { Settings, SettingsSet } from 'modules/Tasks/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type Props = {
  dataCriteria: CriteriaDto[];
  setDataCriteria: Dispatch<SetStateAction<CriteriaDto[]>>;
  taskType: TaskDtoTypeEnum | undefined;
};

const { Text } = Typography;

export function TaskSettings({ dataCriteria, taskType, setDataCriteria }: Props) {
  const [activeKey, setActiveKey] = useState<CollapseProps['activeKey']>([]);
  const { json, github, crossCheck } = getSettings(taskType);

  const collapseItems = [
    {
      label: TASK_SETTINGS_HEADERS.crossCheckCriteria,
      children: <CrossCheckTaskCriteriaPanel dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} />,
      forceRender: true,
      collapsible: isCollapsible(crossCheck),
    },
    {
      label: TASK_SETTINGS_HEADERS.github,
      children: <GitHubPanel />,
      forceRender: true,
      collapsible: isCollapsible(github),
    },
    {
      label: TASK_SETTINGS_HEADERS.jsonAttributes,
      children: <JsonAttributesPanel />,
      forceRender: true,
      collapsible: isCollapsible(json),
    },
  ];

  const handleChange: CollapseProps['onChange'] = key => setActiveKey(key);

  // collapse opened panel(s)
  useEffect(() => {
    setActiveKey([]);
  }, [taskType]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Text strong>Settings for some types of tasks</Text>
      <Collapse items={collapseItems} defaultActiveKey={[]} activeKey={activeKey} onChange={handleChange} accordion />
    </Space>
  );
}

const taskSettingsSet: SettingsSet = {
  json: [
    TaskDtoTypeEnum.Interview,
    TaskDtoTypeEnum.StageInterview,
    TaskDtoTypeEnum.Selfeducation,
    TaskDtoTypeEnum.Codewars,
    TaskDtoTypeEnum.Ipynb,
    TaskDtoTypeEnum.Kotlintask,
    TaskDtoTypeEnum.Objctask,
  ],
  github: [
    TaskDtoTypeEnum.Codejam,
    TaskDtoTypeEnum.Jstask,
    TaskDtoTypeEnum.Ipynb,
    TaskDtoTypeEnum.Kotlintask,
    TaskDtoTypeEnum.Objctask,
    TaskDtoTypeEnum.Cvhtml,
    TaskDtoTypeEnum.Cvmarkdown,
  ],
  crossCheck: [TaskDtoTypeEnum.Htmltask, TaskDtoTypeEnum.Jstask],
};

const defaultSettings: Settings = { json: false, github: false, crossCheck: false };

function getSettings(taskType?: TaskDtoTypeEnum): Settings {
  if (!taskType) {
    return defaultSettings;
  }

  const json = taskSettingsSet.json.includes(taskType);
  const github = taskSettingsSet.github.includes(taskType);
  const crossCheck = taskSettingsSet.crossCheck.includes(taskType);

  return { json, github, crossCheck };
}

function isCollapsible(isPanelEnabled: boolean) {
  return (!isPanelEnabled ? 'disabled' : undefined) as CollapsibleType;
}
