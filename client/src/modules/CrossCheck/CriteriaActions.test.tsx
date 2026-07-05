import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('renders Edit and Delete in read mode', () => {
    setup();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls edit with the record when Edit is clicked', async () => {
    const user = userEvent.setup();
    const props = setup();

    await user.click(screen.getByText('Edit'));

    expect(props.edit).toHaveBeenCalledWith(record);
  });

  it('calls remove with the key after confirming the Delete popconfirm', async () => {
    const user = userEvent.setup();
    const props = setup();

    await user.click(screen.getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    expect(props.remove).toHaveBeenCalledWith('k1');
  });

  it('renders Save and Cancel in edit mode', () => {
    setup({ editing: true });
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls save with the key when Save is clicked', async () => {
    const user = userEvent.setup();
    const props = setup({ editing: true });

    await user.click(screen.getByText('Save'));

    expect(props.save).toHaveBeenCalledWith('k1');
  });

  it('calls cancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const props = setup({ editing: true });

    await user.click(screen.getByText('Cancel'));

    expect(props.cancel).toHaveBeenCalled();
  });

  it('disables Edit when another row is being edited (editingKey set)', () => {
    setup({ editingKey: 'k2' });
    expect(screen.getByText('Edit')).toHaveClass('ant-typography-disabled');
  });
});
