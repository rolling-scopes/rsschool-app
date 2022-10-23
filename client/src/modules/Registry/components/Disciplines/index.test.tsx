import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { DisciplineDto } from 'api';
import { LABELS } from 'modules/Registry/constants';
import { Disciplines } from './index';

const mockDisciplines = [
  {
    name: 'JS',
  },
  {
    name: 'TS',
  },
] as DisciplineDto[];

describe('Disciplines', () => {
  test('should render form item with proper values', async () => {
    render(
      <Form>
        <Disciplines disciplines={mockDisciplines} />
      </Form>,
    );

    const js = await screen.findByDisplayValue(mockDisciplines[0].name);
    const ts = await screen.findByDisplayValue(mockDisciplines[1].name);

    expect(js).toBeInTheDocument();
    expect(ts).toBeInTheDocument();
  });

  test(`should render field with "${LABELS.disciplines}" label`, async () => {
    render(
      <Form name="test">
        <Disciplines disciplines={mockDisciplines} />
      </Form>,
    );

    const fieldLabel = await screen.findByTitle(LABELS.disciplines);
    expect(fieldLabel).toBeInTheDocument();
  });

  test("should render <Empty /> when there's no disciplines", async () => {
    render(
      <Form name="test">
        <Disciplines disciplines={[]} />
      </Form>,
    );

    const noData = await screen.findByText('No Data');
    expect(noData).toBeInTheDocument();
  });
});
