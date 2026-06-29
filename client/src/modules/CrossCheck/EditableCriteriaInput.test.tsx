/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { Form } from 'antd';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CriteriaDtoTypeEnum } from '@client/api';
import { EditableCriteriaInput } from './EditableCriteriaInput';
import { EditableTableColumnsDataIndex } from './constants';

// Form.Item children with a `name` require an antd Form context.
function renderInput(props: React.ComponentProps<typeof EditableCriteriaInput>) {
  return render(
    <Form>
      <EditableCriteriaInput {...props} />
    </Form>,
  );
}

describe('<EditableCriteriaInput />', () => {
  it('renders an InputNumber for the Max column when type is not Title', () => {
    renderInput({
      dataIndex: EditableTableColumnsDataIndex.Max,
      onSelectChange: vi.fn(),
      type: CriteriaDtoTypeEnum.Subtask,
    });
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders nothing for the Max column when type is Title', () => {
    const { container } = renderInput({
      dataIndex: EditableTableColumnsDataIndex.Max,
      onSelectChange: vi.fn(),
      type: CriteriaDtoTypeEnum.Title,
    });
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(container.querySelector('input')).toBeNull();
  });

  it('renders the type Select for the Type column and wires onSelectChange', () => {
    const onSelectChange = vi.fn();
    renderInput({
      dataIndex: EditableTableColumnsDataIndex.Type,
      onSelectChange,
      type: CriteriaDtoTypeEnum.Subtask,
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    fireEvent.click(within(document.body).getByTestId('Penalty'));

    expect(onSelectChange).toHaveBeenCalledWith('penalty', expect.anything());
  });

  it('renders a TextArea for the Text column', () => {
    renderInput({
      dataIndex: EditableTableColumnsDataIndex.Text,
      onSelectChange: vi.fn(),
      type: CriteriaDtoTypeEnum.Subtask,
    });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders nothing for an unknown column (default branch)', () => {
    const { container } = renderInput({
      dataIndex: EditableTableColumnsDataIndex.Actions,
      onSelectChange: vi.fn(),
      type: CriteriaDtoTypeEnum.Subtask,
    });
    expect(container.querySelector('input, textarea, .ant-select')).toBeNull();
  });
});
