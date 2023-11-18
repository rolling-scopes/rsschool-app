import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CriteriaDto } from 'api';
import { LABELS } from 'modules/Tasks/constants';
import { CrossCheckTaskCriteriaPanel } from './CrossCheckTaskCriteriaPanel';

const criteriaMock: CriteriaDto = { type: 'title', text: 'Title', key: 'key', index: 1 };

const renderPanel = (dataCriteria: CriteriaDto[] = [], setDataCriteria = jest.fn()) => {
  render(
    <Form>
      <CrossCheckTaskCriteriaPanel dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} />
    </Form>,
  );
};

describe('Criteria For Cross-Check Task', () => {
  test.each`
    label
    ${LABELS.crossCheckCriteria}
  `('should render fields with $label label', async ({ label }) => {
    renderPanel();

    const field = await screen.findByText(label);
    expect(field).toBeInTheDocument();
  });

  // AddCriteriaForCrossCheck
  test('should render "Criteria Type" field', async () => {
    renderPanel();

    const field = await screen.findByText('Criteria Type');
    expect(field).toBeInTheDocument();
  });

  // Divider
  test('should render divider', async () => {
    renderPanel([criteriaMock]);

    const divider = await screen.findByRole('separator');
    expect(divider).toBeInTheDocument();
  });

  test('should not render divider when no dataCriteria', async () => {
    renderPanel();

    const divider = screen.queryByRole('separator');
    expect(divider).not.toBeInTheDocument();
  });

  // EditableTable
  test('should render criteria table', async () => {
    renderPanel([criteriaMock]);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
  });

  test('should not render criteria table when no dataCriteria', async () => {
    renderPanel();

    const table = screen.queryByRole('table');
    expect(table).not.toBeInTheDocument();
  });

  // ExportJSONButton
  test('should render "Export JSON" button', async () => {
    renderPanel([criteriaMock]);

    const button = await screen.findByRole('button', { name: /export json/i });
    expect(button).toBeInTheDocument();
  });

  test('should not render "Export JSON" button when no dataCriteria', async () => {
    renderPanel();

    const button = screen.queryByRole('button', { name: /export json/i });
    expect(button).not.toBeInTheDocument();
  });
});
