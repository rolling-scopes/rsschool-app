import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CriteriaDto } from '@client/api';
import { TASK_SETTINGS_HEADERS } from '@client/modules/Tasks/constants';
import { TaskSettings } from './TaskSettings';

const renderTaskSettings = (dataCriteria: CriteriaDto[] = [], setDataCriteria = vi.fn()) => {
  render(
    <Form>
      <TaskSettings dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} taskType={undefined} />
    </Form>,
  );
};

describe('TaskSettings', () => {
  it('renders every task setting panel', () => {
    renderTaskSettings();

    for (const header of [
      TASK_SETTINGS_HEADERS.crossCheckCriteria,
      TASK_SETTINGS_HEADERS.github,
      TASK_SETTINGS_HEADERS.jsonAttributes,
    ]) {
      expect(screen.getByText(header)).toBeInTheDocument();
    }
  });
});
