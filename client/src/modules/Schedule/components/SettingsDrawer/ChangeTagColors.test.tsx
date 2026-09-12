/* eslint-disable testing-library/no-node-access */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangeTagColors from './ChangeTagColors';
import { CourseScheduleItemDtoTagEnum as TagEnum } from '@client/api';
import { TAG_NAME_MAP } from '../../constants';

// --- Brittle-widget stub --------------------------------------------------
// antd ColorPicker mounts a full color popover (canvas/sliders) that is heavy and
// awkward to drive in jsdom. Replace it with a minimal controlled input that emits
// a Color-like object exposing toHexString() — exactly what ChangeTagColors consumes.
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  const ColorPicker = (props: { defaultValue?: string; onChange?: (color: { toHexString: () => string }) => void }) => (
    <input
      data-testid="color-picker"
      defaultValue={props.defaultValue}
      onChange={e => props.onChange?.({ toHexString: () => e.target.value })}
    />
  );
  return { ...actual, ColorPicker };
});

const tags = [TagEnum.Coding, TagEnum.Test];

// ChangeTagColors content lives inside a collapsed SettingsItem (antd Collapse) —
// expand its header before reaching the tag chips / color pickers.
async function renderExpanded(props: Parameters<typeof ChangeTagColors>[0]) {
  const user = userEvent.setup();
  const utils = render(<ChangeTagColors {...props} />);
  await user.click(document.querySelector('.ant-collapse-header') as HTMLElement);
  return { ...utils, user };
}

describe('<ChangeTagColors />', () => {
  it('renders, seeds, changes, and handles tag variants', async () => {
    const setTagColors = vi.fn();
    const { rerender } = await renderExpanded({
      tags,
      tagColors: { [TagEnum.Coding]: '#111111', [TagEnum.Test]: '#222222' },
      setTagColors,
    });

    expect(screen.getByText(TAG_NAME_MAP[TagEnum.Coding])).toBeInTheDocument();
    expect(screen.getByText(TAG_NAME_MAP[TagEnum.Test])).toBeInTheDocument();
    expect(screen.getAllByTestId('color-picker')).toHaveLength(tags.length);

    const [coding, test] = screen.getAllByTestId('color-picker') as HTMLInputElement[];
    expect(coding).toHaveValue('#111111');
    expect(test).toHaveValue('#222222');
    fireEvent.change(coding!, { target: { value: '#abcdef' } });
    expect(setTagColors).toHaveBeenCalledWith({
      [TagEnum.Coding]: '#abcdef',
      [TagEnum.Test]: '#222222',
    });

    const unknownTag = 'mystery-tag' as TagEnum;
    rerender(<ChangeTagColors tags={[unknownTag]} tagColors={{}} setTagColors={setTagColors} />);
    expect(screen.getByText('mystery-tag')).toBeInTheDocument();

    rerender(<ChangeTagColors tags={[]} tagColors={{}} setTagColors={setTagColors} />);
    expect(screen.queryByTestId('color-picker')).not.toBeInTheDocument();
  });
});
