/* eslint-disable testing-library/no-node-access */
// antd wires Select option clicks on internal `.ant-select-item-option` nodes that carry no
// stable role/accessible-name hook, so a `document.querySelector` on `.ant-*` is unavoidable
// for the selection test (same convention as LocationSelect.test.tsx / CourseTaskSelect.test.tsx).
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseSelector } from './';
import { Course } from '@client/services/models';

// CourseIcon pulls in svg config assets; stub it to a marker so we can assert order/labels cleanly.
vi.mock('@client/shared/components/Icons/CourseIcon', () => ({
  CourseIcon: ({ course }: { course: Course }) => <span data-testid={`icon-${course.id}`} />,
}));

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 1,
    name: 'Course One',
    alias: 'c1',
    completed: false,
    planned: false,
    inviteOnly: false,
    ...overrides,
  } as Course;
}

const active = makeCourse({ id: 1, name: 'Active Course' });
const archived = makeCourse({ id: 2, name: 'Old Course', completed: true });

describe('<CourseSelector />', () => {
  it('renders nothing when there is no active course', () => {
    const { container } = render(<CourseSelector course={null} courses={[active]} onChangeCourse={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a combobox defaulted to the active course', () => {
    render(<CourseSelector course={active} courses={[active, archived]} onChangeCourse={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Active Course')).toBeInTheDocument();
  });

  it('marks completed courses as archived in the options', () => {
    render(<CourseSelector course={active} courses={[active, archived]} onChangeCourse={vi.fn()} />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getByText(/\(Archived\)/)).toBeInTheDocument();
  });

  it('calls onChangeCourse with the selected course id', async () => {
    const onChangeCourse = vi.fn();
    render(<CourseSelector course={active} courses={[active, archived]} onChangeCourse={onChangeCourse} />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    // antd wires its select handler on the `.ant-select-item-option` wrapper (the
    // role="option" nodes are empty aria mirrors), and option labels are JSX so they
    // have no computed accessible name — locate the wrapper by its content text.
    const option = await waitFor(() => {
      const match = Array.from(document.querySelectorAll('.ant-select-item-option')).find(el =>
        el.textContent?.includes('Old Course'),
      );
      if (!match) throw new Error('option not rendered yet');
      return match as HTMLElement;
    });
    fireEvent.click(option);
    // antd passes (value, option) to onChange.
    expect(onChangeCourse).toHaveBeenCalledWith(2, expect.anything());
  });
});
