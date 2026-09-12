import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { DisciplineDto } from '@client/api';
import { LABELS } from '@client/modules/Registry/constants';
import { Disciplines } from './Disciplines';

const mockDisciplines = [
  {
    name: 'JS',
  },
  {
    name: 'TS',
  },
] as DisciplineDto[];

describe('Disciplines', () => {
  test('renders discipline values, label, and empty state', async () => {
    const { rerender } = render(
      <Form>
        <Disciplines disciplines={mockDisciplines} />
      </Form>,
    );

    expect(await screen.findByDisplayValue('JS')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TS')).toBeInTheDocument();
    expect(screen.getByTitle(LABELS.disciplines)).toBeInTheDocument();

    rerender(
      <Form>
        <Disciplines disciplines={[]} />
      </Form>,
    );

    const noData = await screen.findByText('No data', { selector: ':not(title)' });
    expect(noData).toBeInTheDocument();
  });
});
