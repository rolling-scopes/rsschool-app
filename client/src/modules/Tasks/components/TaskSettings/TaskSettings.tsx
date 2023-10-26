import { Collapse } from 'antd';
import { CriteriaDto } from 'api';

import { CrossCheckTaskCriteriaPanel, GitHubPanel, JsonAttributesPanel } from 'modules/Tasks/components';
import { TASK_SETTINGS_HEADERS } from 'modules/Tasks/constants';

type Props = {
  dataCriteria: CriteriaDto[];
  setDataCriteria: (c: CriteriaDto[]) => void;
};

export function TaskSettings({ dataCriteria, setDataCriteria }: Props) {
  const collapseItems = [
    {
      label: TASK_SETTINGS_HEADERS.crossCheckCriteria,
      children: <CrossCheckTaskCriteriaPanel dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} />,
      forceRender: true,
    },
    {
      label: TASK_SETTINGS_HEADERS.github,
      children: <GitHubPanel />,
      forceRender: true,
    },
    {
      label: TASK_SETTINGS_HEADERS.jsonAttributes,
      children: <JsonAttributesPanel />,
      forceRender: true,
    },
  ];

  return <Collapse items={collapseItems} />;
}
