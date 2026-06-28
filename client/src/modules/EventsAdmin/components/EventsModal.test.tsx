import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DisciplineDto, EventDto } from '@client/api';
import { EventsModal } from './EventsModal';

// Pure presentational wrapper around the shared ModalForm; no API of its own.
// antd Select + Form + ModalForm stay real so the select/validation flow is real.

const disciplines: DisciplineDto[] = [
  { id: 10, name: 'Frontend' },
  { id: 20, name: 'Backend' },
];

const editEvent = {
  id: 3,
  name: 'Intro',
  type: 'lecture_online',
  descriptionUrl: 'https://desc',
  description: 'Some text',
  discipline: { id: 10, name: 'Frontend' },
} as unknown as EventDto;

function makeProps(overrides: Partial<Parameters<typeof EventsModal>[0]> = {}) {
  return {
    data: {} as Partial<EventDto>,
    title: 'Event',
    submit: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
    getInitialValues: (d: Partial<EventDto>) => ({ ...d, disciplineId: d.discipline?.id }),
    disciplines,
    ...overrides,
  } as Parameters<typeof EventsModal>[0];
}

// Open an antd Select by label and pick an option by its visible text.
async function selectOption(user: ReturnType<typeof userEvent.setup>, label: string, optionText: string) {
  const combobox = screen.getByLabelText(label);
  await user.click(combobox);
  const option = await screen.findByText(optionText, { selector: '.ant-select-item-option-content' });
  await user.click(option);
}

describe('<EventsModal />', () => {
  it('renders nothing when data is null', () => {
    const { container } = render(<EventsModal {...makeProps({ data: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and an empty name input when creating', () => {
    render(<EventsModal {...makeProps()} />);

    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('lists the supplied disciplines as options', async () => {
    const user = userEvent.setup();
    render(<EventsModal {...makeProps()} />);

    await user.click(screen.getByLabelText('Discipline'));

    expect(await screen.findByText('Frontend', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
    expect(screen.getByText('Backend', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
  });

  it('shows validation errors and does not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<EventsModal {...props} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please enter event name')).toBeInTheDocument();
    expect(screen.getByText('Please select a type')).toBeInTheDocument();
    expect(screen.getByText('Please select a discipline')).toBeInTheDocument();
    expect(props.submit).not.toHaveBeenCalled();
  });

  it('submits name, selected type, discipline and optional fields', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<EventsModal {...props} />);

    await user.type(screen.getByLabelText('Name'), 'Kickoff');
    await selectOption(user, 'Event Type', 'Online Lecture');
    await selectOption(user, 'Discipline', 'Backend');
    await user.type(screen.getByLabelText('Description URL'), 'https://u');
    await user.type(screen.getByLabelText('Description'), 'desc body');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(props.submit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Kickoff',
          type: 'lecture_online',
          disciplineId: 20,
          descriptionUrl: 'https://u',
          description: 'desc body',
        }),
      ),
    );
  });

  it('prefills name and discipline from getInitialValues when editing', () => {
    render(<EventsModal {...makeProps({ data: editEvent })} />);

    expect(screen.getByLabelText('Name')).toHaveValue('Intro');
    // The discipline select renders its current item label.
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('cancels when the form is untouched', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<EventsModal {...props} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(props.cancel).toHaveBeenCalled();
  });
});
