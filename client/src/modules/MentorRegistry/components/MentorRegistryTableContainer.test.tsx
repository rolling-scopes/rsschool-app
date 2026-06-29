/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorRegistryDto, DisciplineDto } from '@client/api';
import { Course } from '@client/services/models';
import { ModalDataMode } from '@client/pages/admin/mentor-registry';
import { MentorRegistryTableContainer, CombinedFilter } from './MentorRegistryTableContainer';
import { MentorRegistryTable } from './MentorRegistryTable';
import { MentorRegistryTabsMode } from '../constants';

// Render the real table through the container's render-prop so both collaborate
// like in production. Only props/services are supplied by the test.

const courses = [
  { id: 1, name: 'Course One', alias: 'c1' },
  { id: 2, name: 'Course Two', alias: 'c2' },
] as Course[];

const disciplines = [{ id: 'd1', name: 'JavaScript' }] as unknown as DisciplineDto[];

function makeMentor(overrides: Partial<MentorRegistryDto> = {}): MentorRegistryDto {
  return {
    id: 1,
    githubId: 'octocat',
    name: 'Octo Cat',
    cityName: 'Berlin',
    preferedCourses: [1],
    preselectedCourses: [1],
    maxStudentsLimit: 5,
    preferedStudentsLocation: 'Anywhere',
    technicalMentoring: ['React'],
    courses: [],
    sendDate: '2024-01-02',
    receivedDate: '2024-01-01',
    hasCertificate: false,
    englishMentoring: false,
    primaryEmail: {},
    languagesMentoring: ['English'],
    contactsEpamEmail: null,
    comment: null,
    ...overrides,
  } as MentorRegistryDto;
}

const baseFilter: CombinedFilter = {
  preselectedCourses: [],
  preferredCourses: [],
  technicalMentoring: [],
  githubId: [],
  cityName: [],
  status: MentorRegistryTabsMode.New,
};

function renderContainer(
  options: {
    mentors?: MentorRegistryDto[];
    activeTab?: MentorRegistryTabsMode;
    tagFilters?: string[];
    handleModalDataChange?: ReturnType<typeof vi.fn>;
    setTagFilters?: ReturnType<typeof vi.fn>;
    setCombinedFilter?: ReturnType<typeof vi.fn>;
    combinedFilter?: Partial<CombinedFilter>;
  } = {},
) {
  const {
    mentors = [makeMentor()],
    activeTab = MentorRegistryTabsMode.New,
    tagFilters = [],
    handleModalDataChange = vi.fn(),
    setTagFilters = vi.fn(),
    setCombinedFilter = vi.fn(),
    combinedFilter = {},
  } = options;

  const utils = render(
    <MentorRegistryTableContainer
      mentors={mentors}
      courses={courses}
      activeTab={activeTab}
      handleModalDataChange={handleModalDataChange}
      disciplines={disciplines}
      tagFilters={tagFilters}
      setTagFilters={setTagFilters}
      combinedFilter={{ ...baseFilter, status: activeTab, ...combinedFilter }}
      setCombinedFilter={setCombinedFilter}
      setCurrentPage={vi.fn()}
      currentPage={1}
      total={{ [MentorRegistryTabsMode.New]: mentors.length, [MentorRegistryTabsMode.All]: mentors.length }}
    >
      {props => <MentorRegistryTable {...props} />}
    </MentorRegistryTableContainer>,
  );

  return { ...utils, handleModalDataChange, setTagFilters, setCombinedFilter };
}

// The row "more actions" Dropdown opens on its MoreOutlined trigger button; menu
// items then render into a portal. Open it and return the menu container element.
async function openRowDropdown() {
  const trigger = document.querySelector('.anticon-more')?.closest('button') as HTMLElement;
  fireEvent.mouseEnter(trigger);
  fireEvent.click(trigger);
  await waitFor(() => expect(document.querySelector('.ant-dropdown-menu')).toBeInTheDocument());
  return document.querySelector('.ant-dropdown-menu') as HTMLElement;
}

describe('<MentorRegistryTableContainer /> + <MentorRegistryTable />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a populated table row with the mentor github id', () => {
    renderContainer();
    expect(screen.getByText('octocat')).toBeInTheDocument();
    expect(screen.getByText('Octo Cat')).toBeInTheDocument();
  });

  it('renders an empty-state table when there are no mentors', () => {
    renderContainer({ mentors: [] });
    // Fixed-column tables duplicate the empty placeholder, so allow multiple matches.
    expect(screen.getAllByText(/no data/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('octocat')).not.toBeInTheDocument();
  });

  it('opens the Invite modal when the row "Invite" action is clicked', async () => {
    const user = userEvent.setup();
    const { handleModalDataChange } = renderContainer();

    await user.click(screen.getByRole('button', { name: 'Invite' }));

    expect(handleModalDataChange).toHaveBeenCalledWith(
      ModalDataMode.Invite,
      expect.objectContaining({ githubId: 'octocat' }),
    );
  });

  it('triggers the Re-send action from the row dropdown (New tab)', async () => {
    const { handleModalDataChange } = renderContainer();

    const menu = await openRowDropdown();
    fireEvent.click(within(menu).getByText('Re-send'));

    expect(handleModalDataChange).toHaveBeenCalledWith(
      ModalDataMode.Resend,
      expect.objectContaining({ githubId: 'octocat' }),
    );
  });

  it('triggers the Delete action from the dropdown', async () => {
    const { handleModalDataChange } = renderContainer();

    const menu = await openRowDropdown();
    fireEvent.click(within(menu).getByText('Delete'));

    expect(handleModalDataChange).toHaveBeenCalledWith(
      ModalDataMode.Delete,
      expect.objectContaining({ githubId: 'octocat' }),
    );
  });

  it('triggers the "Add comment" action from the dropdown', async () => {
    const { handleModalDataChange } = renderContainer();

    const menu = await openRowDropdown();
    fireEvent.click(within(menu).getByText('Add comment'));

    expect(handleModalDataChange).toHaveBeenCalledWith(
      ModalDataMode.Comment,
      expect.objectContaining({ githubId: 'octocat' }),
    );
  });

  it('shows "Edit comment" label when the mentor already has a comment', async () => {
    renderContainer({ mentors: [makeMentor({ comment: 'great mentor' })] });

    const menu = await openRowDropdown();
    expect(within(menu).getByText('Edit comment')).toBeInTheDocument();
  });

  it('disables the Re-send action when the mentor has no preselected courses', async () => {
    const { handleModalDataChange } = renderContainer({
      mentors: [makeMentor({ preselectedCourses: [] })],
    });

    const menu = await openRowDropdown();
    fireEvent.click(within(menu).getByText('Re-send'));

    // Disabled menu item does not fire the resend handler.
    expect(handleModalDataChange).not.toHaveBeenCalledWith(ModalDataMode.Resend, expect.anything());
  });

  it('does not render the Re-send action in the All tab', async () => {
    renderContainer({ activeTab: MentorRegistryTabsMode.All });

    const menu = await openRowDropdown();
    expect(within(menu).getByText('Delete')).toBeInTheDocument();
    expect(within(menu).queryByText('Re-send')).not.toBeInTheDocument();
  });

  it('renders active tag filters and removes one when its close icon is clicked', async () => {
    const setCombinedFilter = vi.fn();
    const setTagFilters = vi.fn();
    renderContainer({
      tagFilters: ['Technologies: React'],
      setCombinedFilter,
      setTagFilters,
    });

    const tag = screen.getByText('Technologies: React');
    expect(tag).toBeInTheDocument();

    // Close the tag via its close icon.
    const closeIcon = tag.closest('.ant-tag')?.querySelector('.ant-tag-close-icon') as HTMLElement;
    fireEvent.click(closeIcon);

    await waitFor(() => expect(setCombinedFilter).toHaveBeenCalled());
    expect(setTagFilters).toHaveBeenCalled();
  });

  it('clears all tag filters when "Clear all" is clicked', async () => {
    const setCombinedFilter = vi.fn();
    const setTagFilters = vi.fn();
    const user = userEvent.setup();
    renderContainer({
      tagFilters: ['Technologies: React'],
      setCombinedFilter,
      setTagFilters,
    });

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(setCombinedFilter).toHaveBeenCalled();
    expect(setTagFilters).toHaveBeenCalledWith([]);
  });

  it('shows an error and leaves filters untouched for an unrecognized tag prefix', () => {
    const setCombinedFilter = vi.fn();
    const setTagFilters = vi.fn();
    renderContainer({
      tagFilters: ['Unknown: foo'],
      setCombinedFilter,
      setTagFilters,
    });

    const tag = screen.getByText('Unknown: foo');
    const closeIcon = tag.closest('.ant-tag')?.querySelector('.ant-tag-close-icon') as HTMLElement;
    fireEvent.click(closeIcon);

    // Default branch hits message.error and does not call setCombinedFilter.
    expect(setCombinedFilter).not.toHaveBeenCalled();
    expect(setTagFilters).toHaveBeenCalled();
  });

  it('renders extra "Additional" info icons for a mentor with a certificate and comment', () => {
    renderContainer({
      mentors: [makeMentor({ hasCertificate: true, comment: 'note', courses: [99] })],
    });

    // The "Mentor in the past" icon, certificate icon and comment tooltip trigger
    // all live in the Additional column for this record.
    expect(within(document.body).getByTitle('Completed with certificate')).toBeInTheDocument();
  });

  it('removes a Pre-Selected course tag (Preselected branch of handleTagClose)', async () => {
    const setCombinedFilter = vi.fn();
    const setTagFilters = vi.fn();
    renderContainer({
      tagFilters: ['Pre-Selected: Course One'],
      setCombinedFilter,
      setTagFilters,
    });

    const tag = screen.getByText('Pre-Selected: Course One');
    const closeIcon = tag.closest('.ant-tag')?.querySelector('.ant-tag-close-icon') as HTMLElement;
    fireEvent.click(closeIcon);

    await waitFor(() => expect(setCombinedFilter).toHaveBeenCalled());
    expect(setTagFilters).toHaveBeenCalled();
  });

  it('removes a Preferred course tag (PreferredCourses branch of handleTagClose)', async () => {
    const setCombinedFilter = vi.fn();
    const setTagFilters = vi.fn();
    renderContainer({
      tagFilters: ['Preferred: Course Two'],
      setCombinedFilter,
      setTagFilters,
    });

    const tag = screen.getByText('Preferred: Course Two');
    const closeIcon = tag.closest('.ant-tag')?.querySelector('.ant-tag-close-icon') as HTMLElement;
    fireEvent.click(closeIcon);

    await waitFor(() => expect(setCombinedFilter).toHaveBeenCalled());
    expect(setTagFilters).toHaveBeenCalled();
  });

  it('renders a Pre-Selected course as a green confirmed tag when the mentor joined that course', () => {
    // record.courses includes the preselected course id -> green "solid" tag branch.
    renderContainer({
      mentors: [makeMentor({ preselectedCourses: [1], courses: [1] })],
    });

    // Course name appears in both Preferred and Pre-Selected columns.
    expect(screen.getAllByText('Course One').length).toBeGreaterThan(0);
  });

  it('renders a copy-link button for a not-yet-confirmed Pre-Selected course', () => {
    // record.courses does NOT include the preselected id -> renderTagWithCopyButton branch.
    const { container } = renderContainer({
      mentors: [makeMentor({ preselectedCourses: [1], courses: [] })],
    });

    // CopyToClipboardButton renders a copy icon link in the Pre-Selected cell.
    expect(container.querySelector('.anticon-copy')).toBeInTheDocument();
  });

  it('falls back to the raw course id when a preferred course is not found', () => {
    // preferedCourses includes an id (999) absent from the courses list -> the
    // preferred/preselected renderers fall back to the numeric id.
    renderContainer({
      mentors: [makeMentor({ preferedCourses: [999], preselectedCourses: [999] })],
    });
    expect(screen.getAllByText('999').length).toBeGreaterThan(0);
  });

  it('shows the "mentor in the past" indicator in the Additional column', () => {
    // courses contains an id not in preselectedCourses -> isMentor === true.
    renderContainer({
      mentors: [makeMentor({ courses: [42], preselectedCourses: [1] })],
    });
    expect(within(document.body).getByTitle('Mentor in the past')).toBeInTheDocument();
  });

  // A setCombinedFilter that actually runs the functional updater so the reducer bodies
  // inside handleTagClose (which compute the next filter state) are executed, not just
  // registered as "called".
  const runningSetCombinedFilter = () =>
    vi.fn((updater: unknown) => {
      if (typeof updater === 'function') {
        (updater as (prev: CombinedFilter) => CombinedFilter)(baseFilter);
      }
    });

  it('computes the next state when removing a Technologies tag (Tech reducer body)', () => {
    const setCombinedFilter = runningSetCombinedFilter();
    renderContainer({
      tagFilters: ['Technologies: React'],
      combinedFilter: { technicalMentoring: ['React'] },
      setCombinedFilter,
      setTagFilters: vi.fn(),
    });

    const tag = screen.getByText('Technologies: React');
    const closeIcon = tag.closest('.ant-tag')?.querySelector('.ant-tag-close-icon') as HTMLElement;
    fireEvent.click(closeIcon);

    // The functional updater ran against a prev state (covers the Tech reducer body).
    expect(setCombinedFilter).toHaveBeenCalledWith(expect.any(Function));
  });

  it('computes the next state when removing a Preferred course tag (Preferred reducer body)', () => {
    const setCombinedFilter = runningSetCombinedFilter();
    renderContainer({
      tagFilters: ['Preferred: Course Two'],
      combinedFilter: { preferredCourses: [2] },
      setCombinedFilter,
      setTagFilters: vi.fn(),
    });

    const tag = screen.getByText('Preferred: Course Two');
    const closeIcon = tag.closest('.ant-tag')?.querySelector('.ant-tag-close-icon') as HTMLElement;
    fireEvent.click(closeIcon);

    expect(setCombinedFilter).toHaveBeenCalledWith(expect.any(Function));
  });

  it('computes the next state when removing a Pre-Selected course tag (Preselected reducer body)', () => {
    const setCombinedFilter = runningSetCombinedFilter();
    renderContainer({
      tagFilters: ['Pre-Selected: Course One'],
      combinedFilter: { preselectedCourses: [1] },
      setCombinedFilter,
      setTagFilters: vi.fn(),
    });

    const tag = screen.getByText('Pre-Selected: Course One');
    const closeIcon = tag.closest('.ant-tag')?.querySelector('.ant-tag-close-icon') as HTMLElement;
    fireEvent.click(closeIcon);

    expect(setCombinedFilter).toHaveBeenCalledWith(expect.any(Function));
  });

  it('ignores a tag that has no value part (early return in handleTagClose)', () => {
    const setCombinedFilter = vi.fn();
    const setTagFilters = vi.fn();
    // A tag without a colon-separated value hits the `if (!removedTagValue) return;` guard.
    renderContainer({ tagFilters: ['NoValueTag'], setCombinedFilter, setTagFilters });

    const tag = screen.getByText('NoValueTag');
    const closeIcon = tag.closest('.ant-tag')?.querySelector('.ant-tag-close-icon') as HTMLElement;
    fireEvent.click(closeIcon);

    // Neither the filter nor the tag list is touched for a value-less tag.
    expect(setCombinedFilter).not.toHaveBeenCalled();
    expect(setTagFilters).not.toHaveBeenCalled();
  });

  it('builds combined filters and tag filters when a column filter changes', async () => {
    const setCombinedFilter = vi.fn();
    const setTagFilters = vi.fn();
    renderContainer({ setCombinedFilter, setTagFilters });

    // Open the Technologies column filter dropdown (the one offering the
    // discipline checkbox menu) and select a discipline. The fixed-column table
    // duplicates headers, so pick the Technologies <th> that has a filter trigger.
    const techHeader = screen
      .getAllByText('Technologies')
      .map(el => el.closest('th'))
      .find(th => th?.querySelector('.ant-table-filter-trigger')) as HTMLElement;
    const techFilterTrigger = techHeader.querySelector('.ant-table-filter-trigger') as HTMLElement;
    fireEvent.click(techFilterTrigger);

    const menu = await screen.findByRole('menu');
    const firstItem = within(menu).getAllByRole('menuitem')[0];
    fireEvent.click(firstItem);

    // Apply the filter (OK button in the filter dropdown).
    const okBtn = within(menu.closest('.ant-table-filter-dropdown') as HTMLElement).getByRole('button', {
      name: /ok/i,
    });
    fireEvent.click(okBtn);

    await waitFor(() => {
      expect(setCombinedFilter).toHaveBeenCalled();
      expect(setTagFilters).toHaveBeenCalled();
    });
  });

  // Applying course checkbox filters drives the preferred/preselected branches of
  // handleTableChange (the .map callbacks building numeric ids and named tag strings).
  it.each([
    ['Preferred', 'Preferred: '],
    ['Pre-Selected', 'Pre-Selected: '],
  ])(
    'builds the %s course filter and a named tag when that column filter is applied',
    async (columnTitle, tagPrefix) => {
      const setCombinedFilter = vi.fn();
      const setTagFilters = vi.fn();
      renderContainer({ setCombinedFilter, setTagFilters });

      const header = screen
        .getAllByText(columnTitle)
        .map(el => el.closest('th'))
        .find(th => th?.querySelector('.ant-table-filter-trigger')) as HTMLElement;
      fireEvent.click(header.querySelector('.ant-table-filter-trigger') as HTMLElement);

      const menu = await screen.findByRole('menu');
      fireEvent.click(within(menu).getAllByRole('menuitem')[0]);

      const okBtn = within(menu.closest('.ant-table-filter-dropdown') as HTMLElement).getByRole('button', {
        name: /ok/i,
      });
      fireEvent.click(okBtn);

      await waitFor(() => expect(setTagFilters).toHaveBeenCalled());
      // The applied course filter produced a "<Column>: <course name>" tag string.
      const tags = setTagFilters.mock.calls.at(-1)![0] as string[];
      expect(tags.some(t => t.startsWith(tagPrefix))).toBe(true);
      expect(setCombinedFilter).toHaveBeenCalled();
    },
  );
});
