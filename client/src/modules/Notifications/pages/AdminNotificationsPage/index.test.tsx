import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { AdminPage } from './index';

// --- Mocks -----------------------------------------------------------------

vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ courses: [{ id: 1, name: 'Course One' }] }),
}));

// AdminPageLayout pulls in Header + AdminSider (session/router heavy); passthrough.
vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const { getNotifications } = vi.hoisted(() => ({ getNotifications: vi.fn() }));

vi.mock('@client/modules/Notifications/services/notifications', async () => ({
  ...(await vi.importActual('@client/modules/Notifications/services/notifications')),
  NotificationsService: function NotificationsService() {
    return { getNotifications };
  },
}));

describe('Notifications AdminPage wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getNotifications.mockResolvedValue([]);
  });

  it('renders the Notifications title with a Settings tab hosting the admin page', async () => {
    render(<AdminPage />);

    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
    // The inner admin page renders its "Add Notification" button.
    expect(await screen.findByRole('button', { name: /add notification/i })).toBeInTheDocument();
  });
});
