import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSider } from './AdminSider';
import { SessionContext } from 'modules/Course/contexts';
import { Course } from 'services/models';
import { useLocalStorage } from 'react-use';
import { Session } from 'components/withSession';
import { getAdminMenuItems, getCourseManagementMenuItems } from './data/menuItems';
import router from 'next/router';

jest.mock('next/router', () => ({
  __esModule: true,
  default: {
    push: jest.fn(),
  },
}));
jest.mock('react-use');
jest.mock('./data/menuItems');

describe('AdminSider', () => {
  const mockCourses: Course[] = [
    {
      id: 1,
      name: 'Test Course',
      alias: 'test-course',
      description: 'Test Description',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      registrationEndDate: '2023-12-30',
      completed: false,
      planned: false,
      inviteOnly: false,
      createdDate: '2024-01-01',
      updatedDate: '2024-01-01',
      fullName: 'Test Course Full Name',
      descriptionUrl: 'https://test.com',
      year: 2024,
      primarySkillId: 'skill1',
      primarySkillName: 'Test Skill',
      locationName: 'Test Location',
      discordServerId: 123,
      certificateIssuer: 'Test Issuer',
      usePrivateRepositories: false,
      personalMentoring: false,
      personalMentoringStartDate: null,
      personalMentoringEndDate: null,
      logo: 'test-logo.png',
      discipline: null,
      minStudentsPerMentor: 5,
      certificateThreshold: 60,
      wearecommunityUrl: null,
    },
  ];

  const mockSession: Session = {
    id: 1,
    githubId: 'test-user',
    isAdmin: true,
    isHirer: false,
    isActivist: false,
    courses: {},
  };

  const mockAdminMenuItems = [
    { key: 'admin1', name: 'Admin Item 1', icon: <div />, href: '/admin1' },
    { key: 'admin2', name: 'Admin Item 2', icon: <div />, href: '/admin2' },
  ];

  const mockCourseMenuItems = [
    { key: 'course1', name: 'Course Item 1', icon: <div />, href: '/course1' },
    { key: 'course2', name: 'Course Item 2', icon: <div />, href: '/course2' },
  ];

  beforeEach(() => {
    (useLocalStorage as jest.Mock).mockImplementation(key => {
      if (key === 'isSiderCollapsed') return [false, jest.fn()];
      if (key === 'openedSidebarItems') return [[], jest.fn()];
      return [undefined, jest.fn()];
    });

    (getAdminMenuItems as jest.Mock).mockReturnValue(mockAdminMenuItems);
    (getCourseManagementMenuItems as jest.Mock).mockReturnValue(mockCourseMenuItems);
    (router.push as jest.Mock).mockClear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <SessionContext.Provider value={mockSession}>
        <AdminSider courses={mockCourses} {...props} />
      </SessionContext.Provider>,
    );
  };

  it('renders correctly with default props', () => {
    renderComponent();

    expect(screen.getByTestId('admin-sider')).toBeInTheDocument();

    expect(screen.getByText('Admin Area')).toBeInTheDocument();
    expect(screen.getByText('Course Management')).toBeInTheDocument();
  });

  it('handles sidebar collapse toggle', () => {
    const setIsSiderCollapsed = jest.fn();

    (useLocalStorage as jest.Mock).mockImplementation(key => {
      if (key === 'isSiderCollapsed') return [false, setIsSiderCollapsed];
      return [undefined, jest.fn()];
    });

    renderComponent();

    const collapseButton = screen.getByRole('img', { name: 'menu-fold' });
    fireEvent.click(collapseButton);

    expect(setIsSiderCollapsed).toHaveBeenCalledWith(true);
  });

  it('navigates to correct route when menu item is clicked', () => {
    renderComponent();

    const adminArea = screen.getByText('Admin Area');
    fireEvent.click(adminArea);

    const adminItem = screen.getByText('Admin Item 1');
    fireEvent.click(adminItem);

    expect(router.push).toHaveBeenCalledWith('/admin1');
  });

  it('handles course management menu items correctly', () => {
    renderComponent();

    const courseManagement = screen.getByText('Course Management');
    fireEvent.click(courseManagement);

    const courseItem = screen.getByText('Course Item 1');
    fireEvent.click(courseItem);

    expect(router.push).toHaveBeenCalledWith('/course1');
  });

  it('renders correctly when no courses are provided', () => {
    renderComponent({ courses: [] });

    expect(screen.getByText('Admin Area')).toBeInTheDocument();
    expect(screen.getByText('Course Management')).toBeInTheDocument();
  });
});
