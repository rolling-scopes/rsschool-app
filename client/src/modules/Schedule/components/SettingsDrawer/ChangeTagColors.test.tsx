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
  render(<ChangeTagColors {...props} />);
  await user.click(document.querySelector('.ant-collapse-header') as HTMLElement);
  return user;
}

describe('<ChangeTagColors />', () => {
  it('renders a labelled tag chip and a color picker for each tag', async () => {
    await renderExpanded({ tags, tagColors: {}, setTagColors: vi.fn() });

    expect(screen.getByText(TAG_NAME_MAP[TagEnum.Coding])).toBeInTheDocument();
    expect(screen.getByText(TAG_NAME_MAP[TagEnum.Test])).toBeInTheDocument();
    expect(screen.getAllByTestId('color-picker')).toHaveLength(tags.length);
  });

  it('seeds each picker with its current color from tagColors', async () => {
    await renderExpanded({
      tags,
      tagColors: { [TagEnum.Coding]: '#111111', [TagEnum.Test]: '#222222' },
      setTagColors: vi.fn(),
    });

    const [coding, test] = screen.getAllByTestId('color-picker');
    expect(coding).toHaveValue('#111111');
    expect(test).toHaveValue('#222222');
  });

  it('merges the new hex value for the changed tag and preserves the others', async () => {
    const setTagColors = vi.fn();
    await renderExpanded({
      tags,
      tagColors: { [TagEnum.Coding]: '#111111', [TagEnum.Test]: '#222222' },
      setTagColors,
    });

    const [coding] = screen.getAllByTestId('color-picker');
    fireEvent.change(coding, { target: { value: '#abcdef' } });

    expect(setTagColors).toHaveBeenCalledWith({
      [TagEnum.Coding]: '#abcdef',
      [TagEnum.Test]: '#222222',
    });
  });

  it('falls back to the raw tag name when no friendly label exists', async () => {
    const unknownTag = 'mystery-tag' as TagEnum;
    await renderExpanded({ tags: [unknownTag], tagColors: {}, setTagColors: vi.fn() });

    expect(screen.getByText('mystery-tag')).toBeInTheDocument();
  });

  it('renders nothing in the list when there are no tags', async () => {
    await renderExpanded({ tags: [], tagColors: {}, setTagColors: vi.fn() });

    expect(screen.queryByTestId('color-picker')).not.toBeInTheDocument();
  });
});
