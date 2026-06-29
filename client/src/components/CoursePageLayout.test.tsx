/* eslint-disable testing-library/no-container, testing-library/no-node-access -- antd Spin state is read via container query */
import { render, screen } from '@testing-library/react';
import { Course } from '@client/services/models';
import { CoursePageLayout } from './CoursePageLayout';

// Header pulls in SessionContext, navigation, theme switch, etc. Replace with a marker.
vi.mock('@client/shared/components/Header', () => ({
  Header: ({ title, showCourseName }: { title?: string; showCourseName?: boolean }) => (
    <header>
      header
      {title ? <span>{title}</span> : null}
      {showCourseName ? <span>course-name-shown</span> : null}
    </header>
  ),
}));

const course = { id: 1, name: 'RS 2024' } as unknown as Course;

describe('CoursePageLayout', () => {
  it('renders the header with title and the children content', () => {
    render(
      <CoursePageLayout loading={false} githubId="alice" course={course} title="Dashboard">
        <div>page content</div>
      </CoursePageLayout>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('passes showCourseName to the header', () => {
    render(
      <CoursePageLayout loading={false} githubId="alice" course={course} showCourseName>
        <div>content</div>
      </CoursePageLayout>,
    );

    expect(screen.getByText('course-name-shown')).toBeInTheDocument();
  });

  it('renders a busy spinner while loading', () => {
    const { container } = render(
      <CoursePageLayout loading={true} githubId="alice" course={course}>
        <div>content</div>
      </CoursePageLayout>,
    );

    expect(container.querySelector('.ant-spin-spinning')).toBeInTheDocument();
  });

  it('renders the no-access screen when the course is null', () => {
    render(
      <CoursePageLayout loading={false} githubId="alice" course={null as unknown as Course}>
        <div>content</div>
      </CoursePageLayout>,
    );

    expect(screen.getByText('You Have No Access to Course Page')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });
});
