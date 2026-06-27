/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { Form } from 'antd';
import { render, screen, within } from '@testing-library/react';
import { CriteriaDto, CriteriaDtoTypeEnum } from '@client/api';
import { EditableCellForCrossCheck } from './EditableCellForCrossCheck';
import { EditableTableColumnsDataIndex } from './constants';

const record: CriteriaDto = {
  key: 'k1',
  index: 0,
  type: CriteriaDtoTypeEnum.Subtask,
  max: 5,
  text: 'Some criteria',
};

// The cell renders a <td>, and in edit mode an EditableCriteriaInput whose
// Form.Item children need a Form context; wrap in <Form><table>...</table>.
function renderCell(props: Partial<React.ComponentProps<typeof EditableCellForCrossCheck>> = {}) {
  const merged = {
    editing: false,
    dataIndex: EditableTableColumnsDataIndex.Text,
    record,
    index: 0,
    onSelectChange: vi.fn(),
    children: <span>cell content</span>,
    ...props,
  } as React.ComponentProps<typeof EditableCellForCrossCheck>;

  return render(
    <Form>
      <table>
        <tbody>
          <tr>
            <EditableCellForCrossCheck {...merged} />
          </tr>
        </tbody>
      </table>
    </Form>,
  );
}

describe('<EditableCellForCrossCheck />', () => {
  it('renders children in read mode', () => {
    renderCell({ editing: false });
    expect(screen.getByText('cell content')).toBeInTheDocument();
  });

  it('renders an editable input in edit mode instead of children', () => {
    renderCell({ editing: true, dataIndex: EditableTableColumnsDataIndex.Text });
    expect(screen.queryByText('cell content')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('adds a warning title when the record has max === 0', () => {
    const { container } = renderCell({ record: { ...record, max: 0 } });
    const cell = container.querySelector('td') as HTMLElement;
    expect(cell).toHaveAttribute('title', 'Check points for this line');
  });

  it('uses an empty title when the record has a non-zero max', () => {
    const { container } = renderCell({ record: { ...record, max: 5 } });
    const cell = container.querySelector('td') as HTMLElement;
    expect(within(cell).getByText('cell content')).toBeInTheDocument();
    expect(cell.getAttribute('title')).toBe('');
  });
});
