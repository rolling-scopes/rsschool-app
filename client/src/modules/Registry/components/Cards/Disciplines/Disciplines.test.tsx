import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { DisciplineDto } from 'api';
import { LABELS } from 'modules/Registry/constants';
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
  test.each(mockDisciplines)('should render form item with $name value', async ({ name }) => {
    render(
      <Form>
        <Disciplines disciplines={mockDisciplines} />
      </Form>,
    );

    const item = await screen.findByDisplayValue(name);
    expect(item).toBeInTheDocument();
  });

  test(`should render field with "${LABELS.disciplines}" label`, async () => {
    render(
      <Form>
        <Disciplines disciplines={mockDisciplines} />
      </Form>,
    );

    const fieldLabel = await screen.findByTitle(LABELS.disciplines);
    expect(fieldLabel).toBeInTheDocument();
  });

  test("should render <Empty /> when there's no disciplines", async () => {
    render(
      <Form>
        <Disciplines disciplines={[]} />
      </Form>,
    );

    const noData = await screen.findByText('No data');
    expect(noData).toBeInTheDocument();
  });
});
