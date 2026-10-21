import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CriteriaDto } from '@client/api';
import { LABELS } from '@client/modules/Tasks/constants';
import { CrossCheckTaskCriteriaPanel } from './CrossCheckTaskCriteriaPanel';

const criteriaMock: CriteriaDto = { type: 'title', text: 'Title', key: 'key', index: 1 };

const renderPanel = (dataCriteria: CriteriaDto[] = [], setDataCriteria = vi.fn()) => {
  render(
    <Form>
      <CrossCheckTaskCriteriaPanel dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} />
    </Form>,
  );
};

describe('Criteria For Cross-Check Task', () => {
  test('renders the criteria fields without a table or export controls when empty', () => {
    renderPanel();

    expect(screen.getByText(LABELS.crossCheckCriteria)).toBeInTheDocument();
    expect(screen.getByText('Criteria Type')).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /export json/i })).not.toBeInTheDocument();
  });

  test('renders the divider, criteria table and export button when criteria exist', () => {
    renderPanel([criteriaMock]);

    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument();
  });
});
