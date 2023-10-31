import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CriteriaDto } from 'api';
import { TASK_SETTINGS_HEADERS } from 'modules/Tasks/constants';
import { Settings } from 'modules/Tasks/types';
import { TaskSettings } from './TaskSettings';

const settings: Settings = { isJsonRequired: true, isGithubRequired: true, isCrossCheckRequired: true };

const renderTaskSettings = (dataCriteria: CriteriaDto[] = [], setDataCriteria = jest.fn()) => {
  render(
    <Form>
      <TaskSettings dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} requiredSettings={settings} />
    </Form>,
  );
};

describe('TaskSettings', () => {
  test.each`
    header
    ${TASK_SETTINGS_HEADERS.crossCheckCriteria}
    ${TASK_SETTINGS_HEADERS.github}
    ${TASK_SETTINGS_HEADERS.jsonAttributes}
  `('should render task setting panel $header', ({ header }) => {
    renderTaskSettings();

    const panel = screen.getByText(header);
    expect(panel).toBeInTheDocument();
  });
});
