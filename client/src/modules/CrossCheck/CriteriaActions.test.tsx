import { act, fireEvent, render, screen } from '@testing-library/react';
import { CriteriaDto, CriteriaDtoTypeEnum } from '@client/api';
import { CriteriaActions } from './CriteriaActions';

const record: CriteriaDto = {
  key: 'k1',
  index: 0,
  type: CriteriaDtoTypeEnum.Subtask,
  max: 5,
  text: 'Some criteria',
};

function setup(overrides: Partial<React.ComponentProps<typeof CriteriaActions>> = {}) {
  const props = {
    editing: false,
    record,
    editingKey: '',
    save: vi.fn(),
    remove: vi.fn(),
    cancel: vi.fn(),
    edit: vi.fn(),
    ...overrides,
  };
  render(<CriteriaActions {...props} />);
  return props;
}

describe('<CriteriaActions />', () => {
  it('renders and invokes read-mode actions', () => {
    vi.useFakeTimers();
    const props = setup();

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Edit'));
    expect(props.edit).toHaveBeenCalledWith(record);

    fireEvent.click(screen.getByText('Delete'));
    act(() => vi.runOnlyPendingTimers());
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    act(() => vi.runOnlyPendingTimers());
    expect(props.remove).toHaveBeenCalledWith('k1');
    vi.useRealTimers();
  });

  it('renders and invokes edit-mode actions', () => {
    const props = setup({ editing: true });

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save'));
    expect(props.save).toHaveBeenCalledWith('k1');

    fireEvent.click(screen.getByText('Cancel'));
    expect(props.cancel).toHaveBeenCalled();
  });

  it('disables Edit when another row is being edited (editingKey set)', () => {
    setup({ editingKey: 'k2' });
    expect(screen.getByText('Edit')).toHaveClass('ant-typography-disabled');
  });
});
